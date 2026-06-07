import { useState, useMemo } from 'react'
import { Save, GitBranch, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp, FileText, Calendar, Hash, Copy } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { useApp } from '../context/useApp'
import { getActiveCategories } from '../utils/helpers'

export default function ReviewFlowConfig() {
  const { state, updateReviewFlowConfig } = useApp()
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [expandedIds, setExpandedIds] = useState(new Set())

  const activeCategoryCodes = useMemo(() => {
    return new Set(getActiveCategories(state.categories).map((c) => c.code))
  }, [state.categories])

  const activeConfigs = useMemo(() => {
    return state.reviewFlowConfigs.filter((c) => activeCategoryCodes.has(c.categoryCode))
  }, [state.reviewFlowConfigs, activeCategoryCodes])

  const handleToggleTwoLevel = (configId, currentValue) => {
    updateReviewFlowConfig(configId, { requireTwoLevel: !currentValue })
  }

  const handleToggleRule = (configId, ruleKey, currentValue) => {
    const config = state.reviewFlowConfigs.find((c) => c.id === configId)
    if (!config) return
    const currentRules = config.validationRules || {}
    const newRules = { ...currentRules, [ruleKey]: !currentValue }
    updateReviewFlowConfig(configId, { validationRules: newRules })
  }

  const handleMinContentLengthChange = (configId, value) => {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue) || numValue < 0) return
    const config = state.reviewFlowConfigs.find((c) => c.id === configId)
    if (!config) return
    const currentRules = config.validationRules || {}
    const newRules = { ...currentRules, minContentLength: numValue }
    updateReviewFlowConfig(configId, { validationRules: newRules })
  }

  const toggleExpand = (configId) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(configId)) {
      newExpanded.delete(configId)
    } else {
      newExpanded.add(configId)
    }
    setExpandedIds(newExpanded)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    }, 500)
  }

  const twoLevelCount = activeConfigs.filter((c) => c.requireTwoLevel).length
  const hasRulesCount = activeConfigs.filter((c) => {
    const rules = c.validationRules || {}
    return rules.requireAttachment || rules.minContentLength > 0 || rules.requirePublishDate || rules.forbidDuplicateTitle
  }).length

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">审核流配置</h2>
        <p className="text-gray-500 text-sm mt-1">配置各分类信息的审核流程和校验规则</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-800">分类审核流程设置</h3>
          </div>
          <div className="text-sm text-gray-500">
            已开启二级审核：<span className="font-medium text-primary-600">{twoLevelCount}</span> 个分类
            <span className="mx-2 text-gray-300">|</span>
            配置校验规则：<span className="font-medium text-indigo-600">{hasRulesCount}</span> 个分类
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">二级审核说明</p>
                <p className="mt-1 text-blue-600">开启二级审核后，该分类下的信息需经「初审人员」初审通过后，再由「复核人员」终审通过才能发布。任一环节退回，信息都将被退回给编辑人员修改。</p>
              </div>
            </div>
          </div>

          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-700">
                <p className="font-medium">分类校验规则说明</p>
                <p className="mt-1 text-indigo-600">可配置该分类下文章的校验规则，包括附件必填、正文字数限制、发布日期必填、标题重复校验等。保存草稿时仅提示风险，提交审核时按规则严格校验。</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {activeConfigs.map((config) => {
              const rules = config.validationRules || {}
              const isExpanded = expandedIds.has(config.id)
              const hasCustomRules = rules.requireAttachment || rules.minContentLength > 0 || rules.requirePublishDate || rules.forbidDuplicateTitle

              return (
                <div
                  key={config.id}
                  className={`rounded-lg transition-colors ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <div
                    className="flex items-center justify-between py-4 px-3 cursor-pointer"
                    onClick={() => toggleExpand(config.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          config.requireTwoLevel ? 'bg-purple-100' : 'bg-gray-100'
                        }`}
                      >
                        {config.requireTwoLevel ? (
                          <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{config.categoryName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {config.requireTwoLevel ? '二级审核模式：初审 → 复核 → 发布' : '一级审核模式：审核 → 发布'}
                          {hasCustomRules && (
                            <span className="ml-2 text-indigo-600">· 已配置校验规则</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleTwoLevel(config.id, config.requireTwoLevel)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.requireTwoLevel ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            config.requireTwoLevel ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-4">
                      <div className="ml-13 pl-13 border-l-2 border-indigo-100 ml-[52px] pl-6 py-2 space-y-4">
                        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                          分类校验规则
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                                <FileText className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">必须上传附件</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  开启后，该分类文章必须上传附件才能提交审核
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleRule(config.id, 'requireAttachment', !!rules.requireAttachment)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 mt-1 ${
                                rules.requireAttachment ? 'bg-orange-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  rules.requireAttachment ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                                <Hash className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">正文最少字数</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  设置为0表示不限制字数
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 mt-1">
                              <input
                                type="number"
                                min="0"
                                value={rules.minContentLength || 0}
                                onChange={(e) => handleMinContentLengthChange(config.id, e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-center"
                              />
                              <span className="text-xs text-gray-500">字</span>
                            </div>
                          </div>

                          <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">发布日期必填</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  开启后，提交审核前必须设置发布日期
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleRule(config.id, 'requirePublishDate', !!rules.requirePublishDate)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 mt-1 ${
                                rules.requirePublishDate ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  rules.requirePublishDate ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                                <Copy className="w-4 h-4 text-rose-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">标题重复禁止提交</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  开启后，标题重复的文章无法提交审核
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleRule(config.id, 'forbidDuplicateTitle', !!rules.forbidDuplicateTitle)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 mt-1 ${
                                rules.forbidDuplicateTitle ? 'bg-rose-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  rules.forbidDuplicateTitle ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          {saveSuccess && (
            <span className="text-green-600 text-sm mr-4 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              保存成功
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
