import { useState, useMemo } from 'react'
import {
  X,
  Clock,
  GitCompare,
  RotateCcw,
  ChevronRight,
  FileText,
  FolderOpen,
  Building,
  Calendar,
  Paperclip,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../context/useApp'
import { getVersionTypeText, getVersionTypeColor } from '../utils/helpers'

export default function VersionHistoryModal({ article, onClose, showRestore = true }) {
  const { getArticleVersions, compareVersions, restoreArticleFromVersion, state } = useApp()
  const [selectedVersionId, setSelectedVersionId] = useState(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareVersionId, setCompareVersionId] = useState(null)

  const versions = useMemo(() => {
    if (!article) return []
    return getArticleVersions(article.id)
  }, [article, getArticleVersions])

  const currentVersion = useMemo(() => {
    return versions.find((v) => v.id === selectedVersionId) || null
  }, [versions, selectedVersionId])

  const compareVersion = useMemo(() => {
    return versions.find((v) => v.id === compareVersionId) || null
  }, [versions, compareVersionId])

  const differences = useMemo(() => {
    if (!compareMode || !currentVersion || !compareVersion) return []
    return compareVersions(compareVersion, currentVersion)
  }, [compareMode, currentVersion, compareVersion, compareVersions])

  const handleSelectVersion = (versionId) => {
    setSelectedVersionId(versionId)
    setCompareMode(false)
    setCompareVersionId(null)
  }

  const handleRestore = (versionId) => {
    const version = versions.find((v) => v.id === versionId)
    if (!version) return
    if (window.confirm(`确定要从 v${version.version} 版本恢复为草稿吗？`)) {
      restoreArticleFromVersion(versionId)
      onClose?.()
    }
  }

  const canRestore = showRestore && state.currentUser?.role === 'editor'

  const renderFieldDiff = (diff) => {
    if (diff.field === 'content') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">旧版本</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">新版本</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg overflow-auto max-h-60">
              <div
                className="text-sm text-gray-700 prose prose-sm max-w-none"
                style={{ lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: diff.oldValue || '<p class="text-gray-400">无内容</p>' }}
              />
            </div>
            <div className="p-3 bg-green-50 border border-green-100 rounded-lg overflow-auto max-h-60">
              <div
                className="text-sm text-gray-700 prose prose-sm max-w-none"
                style={{ lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: diff.newValue || '<p class="text-gray-400">无内容</p>' }}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 min-w-[60px]">旧值：</span>
        <span className="text-sm px-2 py-1 bg-red-50 text-red-700 rounded flex-1">
          {diff.oldValue || '（空）'}
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500 min-w-[60px]">新值：</span>
        <span className="text-sm px-2 py-1 bg-green-50 text-green-700 rounded flex-1">
          {diff.newValue || '（空）'}
        </span>
      </div>
    )
  }

  const renderVersionDetail = (version) => {
    if (!version) return null
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-800">v{version.version}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getVersionTypeColor(version.versionType)}`}>
              {getVersionTypeText(version.versionType)}
            </span>
          </div>
          <span className="text-xs text-gray-500">{version.operatedAt}</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">标题</div>
              <div className="text-sm text-gray-800 font-medium">{version.title}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <FolderOpen className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">类别</div>
                <div className="text-sm text-gray-700">{version.categoryName}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">科室</div>
                <div className="text-sm text-gray-700">{version.department}</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">发布日期</div>
              <div className="text-sm text-gray-700">{version.publishDate || '（未设置）'}</div>
            </div>
          </div>

          {version.attachmentName && (
            <div className="flex items-start gap-3">
              <Paperclip className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">附件</div>
                <div className="text-sm text-primary-600">{version.attachmentName}</div>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-gray-500 mb-2">正文内容</div>
            <div
              className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 prose prose-sm max-w-none max-h-60 overflow-auto"
              style={{ lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: version.content }}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
          操作人：{version.operatorName}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col fade-in">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">版本历史</h3>
            <span className="text-sm text-gray-500">{article?.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-gray-100 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="text-sm font-medium text-gray-700">共 {versions.length} 个版本</div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {versions.length > 0 ? (
                <div className="py-1">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      onClick={() => handleSelectVersion(version.id)}
                      className={`px-4 py-3 cursor-pointer border-l-2 transition-colors hover:bg-gray-50 ${
                        selectedVersionId === version.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">v{version.version}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full inline-block mb-1.5 ${getVersionTypeColor(version.versionType)}`}>
                        {getVersionTypeText(version.versionType)}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{version.operatedAt}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{version.operatorName}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Clock className="w-10 h-10 mb-2 text-gray-300" />
                  <p className="text-sm">暂无版本记录</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {currentVersion ? (
              <>
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
                  <div className="flex items-center gap-3">
                    {compareMode ? (
                      <div className="flex items-center gap-2">
                        <GitCompare className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">
                          版本对比：v{compareVersion?.version} → v{currentVersion.version}
                        </span>
                        {differences.length > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                            {differences.length} 处变更
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-700">版本详情</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {versions.indexOf(currentVersion) < versions.length - 1 && (
                      <button
                        onClick={() => setCompareMode(!compareMode)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                          compareMode
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        {compareMode ? '关闭对比' : '对比上一版本'}
                      </button>
                    )}
                    {canRestore && currentVersion.versionType !== 'initial' && (
                      <button
                        onClick={() => handleRestore(currentVersion.id)}
                        className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        恢复为草稿
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {compareMode ? (
                    <div className="space-y-5">
                      {differences.length > 0 ? (
                        differences.map((diff) => (
                          <div key={diff.field} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                              {diff.label}
                            </div>
                            {renderFieldDiff(diff)}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <GitCompare className="w-12 h-12 mb-3 text-gray-300" />
                          <p className="text-sm">两个版本内容完全一致，没有差异</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    renderVersionDetail(currentVersion)
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-sm">选择左侧版本查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
