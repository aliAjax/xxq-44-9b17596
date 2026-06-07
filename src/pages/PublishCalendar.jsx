import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, Edit3, Calendar as CalendarIcon, X, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import { useApp } from '../context/useApp'
import { getCalendarDays, getStatusCountByDate, getPendingWithoutDate, formatDate } from '../utils/helpers'

export default function PublishCalendar() {
  const { state, updateArticle } = useApp()
  const navigate = useNavigate()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingDate, setEditingDate] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerArticleId, setDatePickerArticleId] = useState(null)

  const calendarDays = useMemo(() => {
    return getCalendarDays(currentYear, currentMonth)
  }, [currentYear, currentMonth])

  const pendingWithoutDate = useMemo(() => {
    return getPendingWithoutDate(state.articles)
  }, [state.articles])

  const selectedDateArticles = useMemo(() => {
    if (!selectedDate) return []
    const result = getStatusCountByDate(state.articles, selectedDate)
    return result.articles
  }, [state.articles, selectedDate])

  const canScheduleArticle = (article) => {
    if (!article || article.deleted || article.status === 'rejected' || article.status === 'published') return false
    return state.currentUser?.role === 'editor'
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  const handleDateClick = (dateStr) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null)
    } else {
      setSelectedDate(dateStr)
    }
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth())
    setSelectedDate(formatDate(now))
  }

  const handleScheduleDate = (articleId, newDate) => {
    if (!newDate) return
    const article = state.articles.find((a) => a.id === articleId)
    if (!article || !canScheduleArticle(article)) return

    updateArticle(articleId, { publishDate: newDate })
    setShowDatePicker(false)
    setDatePickerArticleId(null)
  }

  const handleClearDate = (articleId) => {
    const article = state.articles.find((a) => a.id === articleId)
    if (!article || !canScheduleArticle(article)) return
    if (window.confirm('确定要清除发布日期吗？')) {
      updateArticle(articleId, { publishDate: '' })
    }
  }

  const handleOpenDatePicker = (articleId, currentDate = '') => {
    setDatePickerArticleId(articleId)
    setEditingDate(currentDate || formatDate(new Date()))
    setShowDatePicker(true)
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const todayStr = formatDate(new Date())

  const monthStats = useMemo(() => {
    const monthArticles = state.articles.filter((a) => {
      if (a.deleted || a.status === 'rejected' || !a.publishDate) return false
      const date = new Date(a.publishDate)
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth
    })
    return {
      total: monthArticles.length,
      published: monthArticles.filter((a) => a.status === 'published').length,
      pending: monthArticles.filter((a) => a.status === 'pending').length,
      draft: monthArticles.filter((a) => a.status === 'draft').length,
      first_reviewed: monthArticles.filter((a) => a.status === 'first_reviewed').length,
    }
  }, [state.articles, currentYear, currentMonth])

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">发布日历</h2>
        <p className="text-gray-500 text-sm mt-1">排期工作台 - 管理文章发布日期</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800 min-w-[140px] text-center">
                  {currentYear}年{currentMonth + 1}月
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
              >
                今天
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100">
              {weekDays.map((day, index) => (
                <div
                  key={day}
                  className={`py-2 text-center text-xs font-medium ${
                    index === 0 || index === 6 ? 'text-red-400' : 'text-gray-500'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayOfWeek = index % 7
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                const dayStats = getStatusCountByDate(state.articles, day.date)
                const isSelected = selectedDate === day.date
                const isToday = day.date === todayStr

                return (
                  <div
                    key={`${day.date}-${index}`}
                    onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                    className={`min-h-[100px] p-2 border-b border-r border-gray-50 transition-colors ${
                      day.isCurrentMonth ? 'cursor-pointer' : 'bg-gray-50'
                    } ${
                      isSelected
                        ? 'bg-primary-50 ring-2 ring-inset ring-primary-500'
                        : day.isCurrentMonth
                        ? 'hover:bg-gray-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-sm font-medium ${
                          !day.isCurrentMonth
                            ? 'text-gray-300'
                            : isToday
                            ? 'text-primary-600 bg-primary-100 rounded-full w-6 h-6 flex items-center justify-center'
                            : isWeekend
                            ? 'text-red-400'
                            : 'text-gray-700'
                        }`}
                      >
                        {day.day}
                      </span>
                      {(dayStats.published + dayStats.pending + dayStats.draft + dayStats.first_reviewed) > 0 && day.isCurrentMonth && (
                        <span className="text-xs text-gray-400">{dayStats.published + dayStats.pending + dayStats.draft + dayStats.first_reviewed}篇</span>
                      )}
                    </div>
                    {(dayStats.published + dayStats.pending + dayStats.draft + dayStats.first_reviewed) > 0 && day.isCurrentMonth && (
                      <div className="mt-1 space-y-0.5">
                        {dayStats.published > 0 && (
                          <div className="text-xs text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-1"></span>
                            {dayStats.published}已发
                          </div>
                        )}
                        {dayStats.pending > 0 && (
                          <div className="text-xs text-orange-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block mr-1"></span>
                            {dayStats.pending}待审
                          </div>
                        )}
                        {dayStats.first_reviewed > 0 && (
                          <div className="text-xs text-blue-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mr-1"></span>
                            {dayStats.first_reviewed}待复
                          </div>
                        )}
                        {dayStats.draft > 0 && (
                          <div className="text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block mr-1"></span>
                            {dayStats.draft}草稿
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm mt-6">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <h3 className="font-medium text-gray-800">待定日期</h3>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  {pendingWithoutDate.length}篇
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                暂未设置发布日期的文章，可快速排期
              </p>
            </div>
            <div className="p-4">
              {pendingWithoutDate.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {pendingWithoutDate.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {article.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{article.categoryName}</span>
                          <span>{article.department}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <StatusTag status={article.status} reviewStage={article.reviewStage} />
                        {canScheduleArticle(article) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDatePicker(article.id)
                            }}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-white rounded transition-colors"
                            title="设置发布日期"
                          >
                            <CalendarIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-white rounded transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">
                  暂无待定日期的文章
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm sticky top-6">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">本月统计</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总计</span>
                <span className="text-lg font-bold text-gray-800">{monthStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">已发布</span>
                <span className="text-sm font-medium text-green-600">{monthStats.published}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">待审核</span>
                <span className="text-sm font-medium text-orange-600">{monthStats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">待复审</span>
                <span className="text-sm font-medium text-blue-600">{monthStats.first_reviewed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">草稿排期</span>
                <span className="text-sm font-medium text-gray-500">{monthStats.draft}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm mt-6">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">
                {selectedDate ? `${selectedDate} 文章详情` : '选择日期查看详情'}
              </h3>
            </div>
            <div className="p-4">
              {selectedDate ? (
                selectedDateArticles.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedDateArticles.map((article) => (
                      <div
                        key={article.id}
                        className="p-3 border border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-800 line-clamp-2">
                          {article.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <StatusTag status={article.status} reviewStage={article.reviewStage} />
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {article.categoryName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          发布科室：{article.department}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {canScheduleArticle(article) && (
                            <button
                              onClick={() => handleOpenDatePicker(article.id, article.publishDate)}
                              className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                            >
                              <CalendarIcon className="w-3.5 h-3.5" />
                              调整日期
                            </button>
                          )}
                          {canScheduleArticle(article) && article.status !== 'published' && (
                            <button
                              onClick={() => handleClearDate(article.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                            >
                              清除日期
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                            className="ml-auto text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            编辑文章 →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    当天没有文章
                  </div>
                )
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  点击日历中的日期查看当天文章
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">设置发布日期</h3>
              <button
                onClick={() => {
                  setShowDatePicker(false)
                  setDatePickerArticleId(null)
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择日期
              </label>
              <input
                type="date"
                value={editingDate}
                onChange={(e) => setEditingDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">快速选择</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setEditingDate(formatDate(new Date()))}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  今天
                </button>
                <button
                  onClick={() => {
                    const date = new Date()
                    date.setDate(date.getDate() + 1)
                    setEditingDate(formatDate(date))
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  明天
                </button>
                <button
                  onClick={() => {
                    const date = new Date()
                    date.setDate(date.getDate() + 7)
                    setEditingDate(formatDate(date))
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  一周后
                </button>
                <button
                  onClick={() => {
                    const date = new Date()
                    date.setDate(date.getDate() + 14)
                    setEditingDate(formatDate(date))
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  两周后
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDatePicker(false)
                  setDatePickerArticleId(null)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={() => handleScheduleDate(datePickerArticleId, editingDate)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                确认设置
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
