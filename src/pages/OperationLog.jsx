import { useState, useMemo } from 'react'
import { Search, ClipboardList, SlidersHorizontal, RefreshCw } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import Pagination from '../components/Pagination'
import { useApp } from '../context/useApp'
import { OPERATION_ACTIONS, getActionText, getActionColor, getRoleText, TIMEOUT_STATUS, filterLogsByDateRange } from '../utils/helpers'

const PAGE_SIZE = 10

export default function OperationLog() {
  const { getOperationLogs } = useApp()
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [action, setAction] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)

  const filteredLogs = useMemo(() => {
    const logs = getOperationLogs({ action, keyword })
    return filterLogsByDateRange(logs, startDate, endDate)
  }, [getOperationLogs, action, keyword, startDate, endDate])

  const dateFilterActive = startDate || endDate

  const handleResetDateFilter = () => {
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const actionOptions = Object.values(OPERATION_ACTIONS)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">操作记录</h2>
        <p className="text-gray-500 text-sm mt-1">查看所有文章操作的历史记录</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="搜索标题或操作人..."
                className="pl-9 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部动作</option>
              {actionOptions.map((act) => (
                <option key={act} value={act}>
                  {getActionText(act)}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
                showDateFilter || dateFilterActive
                  ? 'border-primary-500 text-primary-700 bg-primary-50'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              时间筛选
              {dateFilterActive && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs rounded-full">
                  {startDate && endDate ? 2 : 1}
                </span>
              )}
            </button>
            {dateFilterActive && (
              <button
                onClick={handleResetDateFilter}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                重置时间
              </button>
            )}
          </div>

          {showDateFilter && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">开始日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">结束日期</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  onClick={() => setShowDateFilter(false)}
                  className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">
                  操作人
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  角色
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  动作
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  时效状态
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  文章标题
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-40">
                  操作时间
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 font-medium">
                        {log.operatorName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {getRoleText(log.operatorRole)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                        {getActionText(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.isTimeoutWhenReviewed ? (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            log.timeoutStatusWhenReviewed === TIMEOUT_STATUS.OVERDUE
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {log.timeoutStatusWhenReviewed === TIMEOUT_STATUS.OVERDUE ? '已超时处理' : '即将超时处理'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 line-clamp-1">
                        {log.articleTitle}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{log.operatedAt}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="w-10 h-10 text-gray-300" />
                      <span>暂无操作记录</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
