import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Info,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { useApp } from '../context/useApp'

const SAMPLE_CSV = `标题,类别,发布科室,发布日期,正文,附件名称,附件链接
关于开展2024年度政务公开培训的通知,notice,办公室,2024-06-01,"各科室、各下属单位：
为进一步提升政务公开工作水平，现就开展2024年度政务公开培训通知如下：
一、培训时间
二、培训地点
三、培训内容",培训通知.pdf,https://example.com/training.pdf
2024年第二季度财政收支情况,finance,财务科,2024-07-01,"现将2024年第二季度财政收支情况通报如下：
一、一般公共预算收支情况
二、政府性基金预算收支情况",收支情况表.xlsx,https://example.com/finance.xlsx
`

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  if (lines.length === 0) return []

  const result = []
  let currentRow = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '' && !inQuotes) continue

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      const nextChar = line[j + 1]

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentField += '"'
          j++
        } else if (char === '"') {
          inQuotes = false
        } else {
          currentField += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          currentRow.push(currentField)
          currentField = ''
        } else {
          currentField += char
        }
      }
    }

    if (inQuotes) {
      currentField += '\n'
    } else {
      currentRow.push(currentField)
      result.push(currentRow)
      currentRow = []
      currentField = ''
    }
  }

  if (currentRow.length > 0) {
    currentRow.push(currentField)
    result.push(currentRow)
  }

  return result
}

function validateRow(row, categories, departments, existingTitles, rowIndex) {
  const errors = []
  const warnings = []

  const [title, categoryCode, department, publishDate, content, attachmentName, attachmentUrl] = row

  if (!title || !title.trim()) {
    errors.push('标题不能为空')
  }

  if (!content || !content.trim()) {
    errors.push('正文不能为空')
  }

  if (categoryCode && categoryCode.trim()) {
    const category = categories.find((c) => c.code === categoryCode.trim())
    if (!category) {
      errors.push(`类别代码"${categoryCode}"无效`)
    }
  } else {
    errors.push('类别不能为空')
  }

  if (department && department.trim()) {
    const dept = departments.find((d) => d.name === department.trim())
    if (!dept) {
      errors.push(`发布科室"${department}"不存在`)
    }
  } else {
    errors.push('发布科室不能为空')
  }

  if (publishDate && publishDate.trim()) {
    const date = new Date(publishDate.trim())
    if (isNaN(date.getTime())) {
      errors.push(`发布日期"${publishDate}"格式无效`)
    }
  }

  if (title && title.trim() && existingTitles.has(title.trim())) {
    warnings.push('标题与现有文章重复')
  }

  return {
    rowIndex,
    title: title || '',
    categoryCode: categoryCode || '',
    department: department || '',
    publishDate: publishDate || '',
    content: content || '',
    attachmentName: attachmentName || '',
    attachmentUrl: attachmentUrl || '',
    errors,
    warnings,
    isValid: errors.length === 0,
  }
}

export default function BatchImport() {
  const { state, batchAddArticles } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [inputMode, setInputMode] = useState('upload')
  const [csvText, setCsvText] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  const existingTitles = new Set(
    state.articles.filter((a) => !a.deleted).map((a) => a.title.trim())
  )

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        setCsvText(text)
        processCSV(text)
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handlePasteParse = () => {
    if (!csvText.trim()) {
      alert('请输入CSV文本内容')
      return
    }
    processCSV(csvText)
  }

  const processCSV = (text) => {
    const rows = parseCSV(text)
    if (rows.length < 2) {
      alert('CSV文件格式不正确，至少需要表头和一行数据')
      return
    }

    const dataRows = rows.slice(1)
    const validatedRows = dataRows.map((row, index) =>
      validateRow(row, state.categories, state.departments, existingTitles, index + 1)
    )

    const titleCounts = {}
    validatedRows.forEach((row) => {
      const title = row.title.trim()
      if (title) {
        titleCounts[title] = (titleCounts[title] || 0) + 1
      }
    })

    validatedRows.forEach((row) => {
      const title = row.title.trim()
      if (title && titleCounts[title] > 1) {
        if (!row.warnings.includes('导入数据内存在重复标题')) {
          row.warnings.push('导入数据内存在重复标题')
        }
      }
    })

    setParsedData(validatedRows)
    setImportResult(null)
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '批量导入模板.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (!parsedData) return

    const validRows = parsedData.filter((row) => row.isValid)
    if (validRows.length === 0) {
      alert('没有可导入的有效数据，请修正错误后重试')
      return
    }

    const hasWarnings = validRows.some((row) => row.warnings.length > 0)
    if (hasWarnings) {
      const confirm = window.confirm(
        '部分数据存在警告信息（如重复标题），是否仍要继续导入？'
      )
      if (!confirm) return
    }

    setIsImporting(true)

    setTimeout(() => {
      const articles = validRows.map((row) => ({
        title: row.title.trim(),
        category: row.categoryCode.trim(),
        department: row.department.trim(),
        publishDate: row.publishDate.trim(),
        content: row.content.trim().replace(/\n/g, '<br>'),
        attachmentName: row.attachmentName.trim(),
        attachmentUrl: row.attachmentUrl.trim(),
        status: 'draft',
      }))

      const imported = batchAddArticles(articles)

      setImportResult({
        total: parsedData.length,
        success: imported.length,
        failed: parsedData.length - validRows.length,
        warnings: validRows.filter((r) => r.warnings.length > 0).length,
      })

      setIsImporting(false)
    }, 500)
  }

  const handleReset = () => {
    setCsvText('')
    setParsedData(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validCount = parsedData ? parsedData.filter((r) => r.isValid).length : 0
  const errorCount = parsedData ? parsedData.filter((r) => !r.isValid).length : 0
  const warningCount = parsedData
    ? parsedData.filter((r) => r.warnings.length > 0 && r.isValid).length
    : 0

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link
          to="/admin/articles"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
        <h2 className="text-xl font-bold text-gray-800">批量导入公开信息</h2>
        <p className="text-gray-500 text-sm mt-1">
          通过CSV文件或粘贴文本批量导入政务公开信息草稿
        </p>
      </div>

      {importResult ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">导入完成</h3>
            <p className="text-gray-500 mb-6">批量导入操作已完成</p>

            <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-800">
                  {importResult.total}
                </div>
                <div className="text-sm text-gray-500">总记录数</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.success}
                </div>
                <div className="text-sm text-gray-500">导入成功</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.failed}
                </div>
                <div className="text-sm text-gray-500">导入失败</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {importResult.warnings}
                </div>
                <div className="text-sm text-gray-500">存在警告</div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                继续导入
              </button>
              <button
                onClick={() => navigate('/admin/articles')}
                className="px-5 py-2.5 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-medium"
              >
                返回文章列表
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-800">数据输入</h3>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Download className="w-4 h-4" />
                  下载模板
                </button>
              </div>

              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    inputMode === 'upload'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-sm font-medium">上传CSV文件</div>
                </button>
                <button
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    inputMode === 'paste'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-sm font-medium">粘贴CSV文本</div>
                </button>
              </div>

              {inputMode === 'upload' ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">点击选择或拖拽CSV文件到此处</p>
                  <p className="text-gray-400 text-sm">支持UTF-8编码的CSV文件</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div>
                  <textarea
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="请粘贴CSV内容，第一行为表头..."
                    className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-mono"
                  />
                  <button
                    onClick={handlePasteParse}
                    className="mt-3 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium"
                  >
                    解析数据
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 border-t border-blue-100">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">CSV格式说明</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    <li>第一行为表头，列顺序：标题、类别、发布科室、发布日期、正文、附件名称、附件链接</li>
                    <li>类别使用英文代码（如 policy、notice、plan、finance、personnel、emergency、keyarea）</li>
                    <li>发布科室使用科室全称，需与系统中已有的科室名称一致</li>
                    <li>发布日期格式：YYYY-MM-DD，可为空</li>
                    <li>正文中包含逗号或换行时需用双引号包裹</li>
                    <li>标题和正文为必填项</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {parsedData && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-medium text-gray-800">数据预览</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">
                      共 <span className="font-medium text-gray-700">{parsedData.length}</span> 条
                    </span>
                    <span className="text-green-600">
                      ✓ {validCount} 条有效
                    </span>
                    {errorCount > 0 && (
                      <span className="text-red-600">
                        ✗ {errorCount} 条错误
                      </span>
                    )}
                    {warningCount > 0 && (
                      <span className="text-yellow-600">
                        ⚠ {warningCount} 条警告
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    重新导入
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={validCount === 0 || isImporting}
                    className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        导入中...
                      </>
                    ) : (
                      '确认导入草稿'
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-16">
                        行号
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        标题
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                        类别
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                        发布科室
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                        发布日期
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-50 ${
                          !row.isValid
                            ? 'bg-red-50'
                            : row.warnings.length > 0
                            ? 'bg-yellow-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {row.rowIndex}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 font-medium line-clamp-1">
                            {row.title || '(空)'}
                          </div>
                          {(row.errors.length > 0 || row.warnings.length > 0) && (
                            <div className="mt-1 space-y-0.5">
                              {row.errors.map((err, i) => (
                                <div
                                  key={`err-${i}`}
                                  className="text-xs text-red-600 flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  {err}
                                </div>
                              ))}
                              {row.warnings.map((warn, i) => (
                                <div
                                  key={`warn-${i}`}
                                  className="text-xs text-yellow-600 flex items-center gap-1"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  {warn}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.categoryCode || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.department || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.publishDate || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {row.isValid ? (
                            row.warnings.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                                <AlertTriangle className="w-3 h-3" />
                                有警告
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                                <CheckCircle className="w-3 h-3" />
                                有效
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                              <XCircle className="w-3 h-3" />
                              有错误
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}
