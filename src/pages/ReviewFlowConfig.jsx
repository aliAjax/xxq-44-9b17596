import { useState } from 'react'
import { Save, GitBranch, CheckCircle2, XCircle, Info } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { useApp } from '../context/useApp'

export default function ReviewFlowConfig() {
  const { state, updateReviewFlowConfig } = useApp()
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleToggle = (configId, currentValue) => {
    updateReviewFlowConfig(configId, { requireTwoLevel: !currentValue })
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    }, 500)
  }

  const twoLevelCount = state.reviewFlowConfigs.filter((c) => c.requireTwoLevel).length

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">审核流配置</h2>
        <p className="text-gray-500 text-sm mt-1">配置各分类信息的审核流程，开启二级审核需经初审和复核后才能发布</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-800">分类审核流程设置</h3>
          </div>
          <div className="text-sm text-gray-500">
            已开启二级审核：<span className="font-medium text-primary-600">{twoLevelCount}</span> 个分类
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

          <div className="divide-y divide-gray-100">
            {state.reviewFlowConfigs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between py-4 px-3 hover:bg-gray-50 rounded-lg transition-colors"
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
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(config.id, config.requireTwoLevel)}
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
              </div>
            ))}
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
