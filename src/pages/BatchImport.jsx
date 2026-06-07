import { useState, useRef, useEffect, useMemo, Fragment } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Info,
  Save,
  FileArchive,
  X,
  ChevronDown,
  ChevronUp,
  Paperclip,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { useApp } from '../context/useApp'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { getValidationRules, getContentTextLength, getActiveCategories, getActiveDepartments } from '../utils/helpers'

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

function validateRow(rowData, categories, departments, existingTitles, allRows, reviewFlowConfigs) {
  const errors = []
  const warnings = []

  const { title, categoryCode, department, publishDate, content, attachmentName, attachmentUrl } = rowData

  if (!title || !title.trim()) {
    errors.push('标题不能为空')
  }

  if (!content || !content.trim()) {
    errors.push('正文不能为空')
  }

  let category = null
  if (categoryCode && categoryCode.trim()) {
    category = categories.find((c) => c.code === categoryCode.trim())
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

  if (category && reviewFlowConfigs) {
    const config = reviewFlowConfigs.find((c) => c.categoryCode === category.code)
    const rules = getValidationRules(config)

    if (rules.requireAttachment) {
      const hasAttachment = (attachmentName && attachmentName.trim()) ||
        (attachmentUrl && attachmentUrl.trim())
      if (!hasAttachment) {
        warnings.push(`该分类要求必须上传附件`)
      }
    }

    if (rules.minContentLength > 0) {
      const contentLength = getContentTextLength(content)
      if (content && contentLength > 0 && contentLength < rules.minContentLength) {
        warnings.push(`正文内容字数不足 ${rules.minContentLength} 字（当前 ${contentLength} 字）`)
      }
    }

    if (rules.requirePublishDate && !publishDate) {
      warnings.push('该分类要求发布日期为必填项')
    }

    if (rules.forbidDuplicateTitle && title && title.trim()) {
      const trimmedTitle = title.trim()
      if (existingTitles.has(trimmedTitle)) {
        warnings.push('该分类禁止重复标题，当前标题与现有文章重复')
      }
      if (allRows) {
        const sameTitleCount = allRows.filter(
          (r) => r.title && r.title.trim() === trimmedTitle
        ).length
        if (sameTitleCount > 1) {
          if (!warnings.includes('该分类禁止重复标题，导入数据内存在重复标题')) {
            warnings.push('该分类禁止重复标题，导入数据内存在重复标题')
          }
        }
      }
    }
  }

  if (title && title.trim() && existingTitles.has(title.trim())) {
    if (!warnings.some((w) => w.includes('标题与现有文章重复') || w.includes('禁止重复标题'))) {
      warnings.push('标题与现有文章重复')
    }
  }

  if (title && title.trim() && allRows) {
    const sameTitleCount = allRows.filter(
      (r) => r.title && r.title.trim() === title.trim()
    ).length
    if (sameTitleCount > 1) {
      if (!warnings.some((w) => w.includes('导入数据内存在重复标题'))) {
        warnings.push('导入数据内存在重复标题')
      }
    }
  }

  return {
    ...rowData,
    errors,
    warnings,
    isValid: errors.length === 0,
  }
}

export default function BatchImport() {
  const {
    state,
    saveImportDraft,
    updateImportDraft,
    getImportDraftById,
    partialBatchImport,
  } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef(null)

  const [inputMode, setInputMode] = useState('upload')
  const [csvText, setCsvText] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [currentDraftId, setCurrentDraftId] = useState(null)

  const existingTitles = useMemo(
    () => new Set(state.articles.filter((a) => !a.deleted).map((a) => a.title.trim())),
    [state.articles]
  )

  const activeCategories = useMemo(() => getActiveCategories(state.categories), [state.categories])
  const activeDepartments = useMemo(() => getActiveDepartments(state.departments), [state.departments])

  const generateTemplateCSV = useMemo(() => {
    const sampleCat = activeCategories[0]
    const sampleDept = activeDepartments[0]
    const catCode = sampleCat ? sampleCat.code : 'notice'
    const deptName = sampleDept ? sampleDept.name : '办公室'
    return `标题,类别,发布科室,发布日期,正文,附件名称,附件链接
关于开展2024年度政务公开培训的通知,${catCode},${deptName},2024-06-01,"各科室、各下属单位：
为进一步提升政务公开工作水平，现就开展2024年度政务公开培训通知如下：
一、培训时间
二、培训地点
三、培训内容",培训通知.pdf,https://example.com/training.pdf
`
  }, [activeCategories, activeDepartments])

  const categoryListText = useMemo(() => {
    return activeCategories.map((c) => `${c.name}（代码：${c.code}）`).join('、')
  }, [activeCategories])

  const departmentListText = useMemo(() => {
    return activeDepartments.map((d) => d.name).join('、')
  }, [activeDepartments])

  useEffect(() => {
    const draftId = searchParams.get('draftId')
    if (draftId && !parsedData) {
      let draft = null

      if (state.importDrafts.length > 0) {
        draft = getImportDraftById(draftId)
      }

      if (!draft) {
        const currentUserId = state.currentUser?.id
        const allDrafts = storage.get(STORAGE_KEYS.IMPORT_DRAFTS) || []
        draft = allDrafts.find((d) => d.id === draftId && d.createdBy === currentUserId) || null
      }

      if (draft) {
        setParsedData(draft.rows)
        setCurrentDraftId(draft.id)
        setDraftName(draft.name)
        setInputMode(draft.sourceType)
      }
    }
  }, [searchParams, getImportDraftById, state.importDrafts, state.currentUser, parsedData])

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        setCsvText(text)
        processCSV(text)
        setCurrentDraftId(null)
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
    setCurrentDraftId(null)
  }

  const processCSV = (text) => {
    const rows = parseCSV(text)
    if (rows.length < 2) {
      alert('CSV文件格式不正确，至少需要表头和一行数据')
      return
    }

    const dataRows = rows.slice(1)
    const initialRows = dataRows.map((row, index) => ({
      rowIndex: index + 1,
      title: row[0] || '',
      categoryCode: row[1] || '',
      department: row[2] || '',
      publishDate: row[3] || '',
      content: row[4] || '',
      attachmentName: row[5] || '',
      attachmentUrl: row[6] || '',
      errors: [],
      warnings: [],
      isValid: false,
    }))

    const validatedRows = initialRows.map((row) =>
      validateRow(row, activeCategories, activeDepartments, existingTitles, initialRows, state.reviewFlowConfigs)
    )

    setParsedData(validatedRows)
    setImportResult(null)
    setSelectedRows(new Set(validatedRows.filter((r) => r.isValid).map((_, i) => i)))
    setExpandedRows(new Set())
  }

  const revalidateAllRows = (rows) => {
    return rows.map((row) =>
      validateRow(row, activeCategories, activeDepartments, existingTitles, rows, state.reviewFlowConfigs)
    )
  }

  const handleRowFieldChange = (rowIndex, field, value) => {
    const newData = [...parsedData]
    newData[rowIndex] = {
      ...newData[rowIndex],
      [field]: value,
    }
    const validated = revalidateAllRows(newData)
    setParsedData(validated)

    const newSelected = new Set(selectedRows)
    for (let i = 0; i < validated.length; i++) {
      if (!validated[i].isValid && newSelected.has(i)) {
        newSelected.delete(i)
      }
    }
    setSelectedRows(newSelected)
  }

  const handleSelectRow = (index, checked) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      if (parsedData[index].isValid) {
        newSelected.add(index)
      } else {
        alert('错误行无法选择导入，请先修正错误')
        return
      }
    } else {
      newSelected.delete(index)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const validIndexes = parsedData
        .map((row, index) => (row.isValid ? index : -1))
        .filter((i) => i !== -1)
      setSelectedRows(new Set(validIndexes))
    } else {
      setSelectedRows(new Set())
    }
  }

  const toggleExpandRow = (index) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([generateTemplateCSV], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '批量导入模板.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSaveDraftClick = () => {
    if (!parsedData) return
    setDraftName(currentDraftId ? draftName : `导入草稿-${new Date().toLocaleString()}`)
    setShowSaveDraftModal(true)
  }

  const handleSaveDraft = () => {
    if (!parsedData) return

    const validCount = parsedData.filter((r) => r.isValid).length
    const errorCount = parsedData.filter((r) => !r.isValid).length
    const warningCount = parsedData.filter((r) => r.warnings.length > 0 && r.isValid).length

    const draftData = {
      name: draftName.trim() || `导入草稿-${new Date().toLocaleString()}`,
      rows: parsedData,
      totalCount: parsedData.length,
      validCount,
      errorCount,
      warningCount,
      sourceType: inputMode,
    }

    if (currentDraftId) {
      updateImportDraft(currentDraftId, draftData)
    } else {
      const newDraft = saveImportDraft(draftData)
      if (newDraft) {
        setCurrentDraftId(newDraft.id)
      }
    }

    setShowSaveDraftModal(false)
    alert('草稿保存成功！')
  }

  const handleImport = () => {
    if (!parsedData) return

    const selectedIndexes = Array.from(selectedRows)
    if (selectedIndexes.length === 0) {
      alert('请选择要导入的行')
      return
    }

    const validRows = selectedIndexes
      .map((i) => parsedData[i])
      .filter((row) => row.isValid)

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

      const imported = partialBatchImport(articles, currentDraftId)

      if (currentDraftId) {
        setCurrentDraftId(null)
      }

      setImportResult({
        total: parsedData.length,
        selected: selectedIndexes.length,
        success: imported.length,
        failed: selectedIndexes.length - validRows.length,
        warnings: validRows.filter((r) => r.warnings.length > 0).length,
      })

      setIsImporting(false)
    }, 500)
  }

  const handleReset = () => {
    if (parsedData && !window.confirm('确定要重新开始吗？当前数据将丢失。')) {
      return
    }
    setCsvText('')
    setParsedData(null)
    setImportResult(null)
    setSelectedRows(new Set())
    setExpandedRows(new Set())
    setCurrentDraftId(null)
    setDraftName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validCount = parsedData ? parsedData.filter((r) => r.isValid).length : 0
  const errorCount = parsedData ? parsedData.filter((r) => !r.isValid).length : 0
  const warningCount = parsedData
    ? parsedData.filter((r) => r.warnings.length > 0 && r.isValid).length
    : 0
  const selectedCount = selectedRows.size
  const allValidSelected =
    parsedData && validCount > 0 && selectedCount === validCount

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">批量导入公开信息</h2>
            <p className="text-gray-500 text-sm mt-1">
              通过CSV文件或粘贴文本批量导入政务公开信息草稿
            </p>
          </div>
          {parsedData && (
            <button
              onClick={() => navigate('/admin/import-drafts')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <FileArchive className="w-4 h-4" />
              草稿箱
              {state.importDrafts.length > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                  {state.importDrafts.length}
                </span>
              )}
            </button>
          )}
        </div>
        {currentDraftId && (
          <div className="mt-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700 inline-flex items-center gap-2">
            <FileArchive className="w-4 h-4" />
            正在编辑草稿：<span className="font-medium">{draftName}</span>
          </div>
        )}
      </div>

      {importResult ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">导入完成</h3>
            <p className="text-gray-500 mb-6">批量导入操作已完成</p>

            <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-800">
                  {importResult.total}
                </div>
                <div className="text-sm text-gray-500">总记录数</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.selected}
                </div>
                <div className="text-sm text-gray-500">已选择</div>
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
                onClick={() => navigate('/admin/import-drafts')}
                className="px-5 py-2.5 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium flex items-center gap-2"
              >
                <FileArchive className="w-4 h-4" />
                草稿箱
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
                    <li>类别使用英文代码，当前可用：{categoryListText || '暂无'}</li>
                    <li>发布科室使用科室全称，当前可用：{departmentListText || '暂无'}</li>
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
              <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <h3 className="font-medium text-gray-800">数据预览与编辑</h3>
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
                    <span className="text-blue-600">
                      ☐ 已选 {selectedCount} 条
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDraftClick}
                    className="px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {currentDraftId ? '更新草稿' : '保存草稿'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    重新导入
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={selectedCount === 0 || isImporting}
                    className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        导入中...
                      </>
                    ) : (
                      `导入选中的 ${selectedCount} 条`
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase w-10">
                        <input
                          type="checkbox"
                          checked={allValidSelected}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase w-14">
                        行号
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">
                        标题
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                        类别
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                        发布科室
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                        发布日期
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase w-20">
                        状态
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase w-20">
                        展开
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, index) => (
                      <Fragment key={index}>
                        <tr
                          className={`border-b border-gray-50 ${
                            !row.isValid
                              ? 'bg-red-50'
                              : row.warnings.length > 0
                              ? 'bg-yellow-50'
                              : 'hover:bg-gray-50'
                          } ${expandedRows.has(index) ? 'bg-gray-50' : ''}`}
                        >
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(index)}
                              onChange={(e) => handleSelectRow(index, e.target.checked)}
                              disabled={!row.isValid}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {row.rowIndex}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) =>
                                handleRowFieldChange(index, 'title', e.target.value)
                              }
                              className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                                row.errors.some((e) => e.includes('标题'))
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.categoryCode}
                              onChange={(e) =>
                                handleRowFieldChange(index, 'categoryCode', e.target.value)
                              }
                              className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                                row.errors.some((e) => e.includes('类别'))
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <option value="">请选择</option>
                              {state.categories.map((cat) => (
                                <option key={cat.code} value={cat.code}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.department}
                              onChange={(e) =>
                                handleRowFieldChange(index, 'department', e.target.value)
                              }
                              className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                                row.errors.some((e) => e.includes('科室'))
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <option value="">请选择</option>
                              {state.departments.map((dept) => (
                                <option key={dept.id} value={dept.name}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              value={row.publishDate}
                              onChange={(e) =>
                                handleRowFieldChange(index, 'publishDate', e.target.value)
                              }
                              className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                                row.errors.some((e) => e.includes('日期'))
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
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
                          <td className="px-3 py-2">
                            <button
                              onClick={() => toggleExpandRow(index)}
                              className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="展开详情"
                            >
                              {expandedRows.has(index) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(index) && (
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <td colSpan="8" className="px-6 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    错误与警告
                                  </label>
                                  <div className="space-y-1">
                                    {row.errors.map((err, i) => (
                                      <div
                                        key={`err-${i}`}
                                        className="text-xs text-red-600 flex items-center gap-1"
                                      >
                                        <XCircle className="w-3 h-3 flex-shrink-0" />
                                        {err}
                                      </div>
                                    ))}
                                    {row.warnings.map((warn, i) => (
                                      <div
                                        key={`warn-${i}`}
                                        className="text-xs text-yellow-600 flex items-center gap-1"
                                      >
                                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                        {warn}
                                      </div>
                                    ))}
                                    {row.errors.length === 0 && row.warnings.length === 0 && (
                                      <div className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        数据校验通过
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    正文内容
                                  </label>
                                  <textarea
                                    value={row.content}
                                    onChange={(e) =>
                                      handleRowFieldChange(index, 'content', e.target.value)
                                    }
                                    rows={4}
                                    className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                                      row.errors.some((e) => e.includes('正文'))
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200'
                                    }`}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    附件信息
                                  </label>
                                  <div className="flex gap-3">
                                    <div className="flex-1">
                                      <div className="relative">
                                        <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                          type="text"
                                          value={row.attachmentName}
                                          onChange={(e) =>
                                            handleRowFieldChange(
                                              index,
                                              'attachmentName',
                                              e.target.value
                                            )
                                          }
                                          placeholder="附件名称"
                                          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        value={row.attachmentUrl}
                                        onChange={(e) =>
                                          handleRowFieldChange(
                                            index,
                                            'attachmentUrl',
                                            e.target.value
                                          )
                                        }
                                        placeholder="附件链接URL"
                                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  已选择 <span className="font-medium text-primary-600">{selectedCount}</span> / {validCount} 条有效数据
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDraftClick}
                    className="px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {currentDraftId ? '更新草稿' : '保存草稿'}
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={selectedCount === 0 || isImporting}
                    className="px-5 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        导入中...
                      </>
                    ) : (
                      <>
                        导入选中的 {selectedCount} 条草稿
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showSaveDraftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {currentDraftId ? '更新草稿' : '保存草稿'}
              </h3>
              <button
                onClick={() => setShowSaveDraftModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                草稿名称
              </label>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="请输入草稿名称"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                保存后可在『导入草稿箱』中继续编辑，刷新页面不会丢失
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowSaveDraftModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
