import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { GetCountNumberResponseData } from '../_api/get-count-number'
import { getCountNumber } from '../_api/get-count-number'
import { submitCountNumber, SubmitCountNumberRequestData, SubmitCountNumberResponseData } from '../_api/submit-count-number'

// 定义 State 接口
interface CountNumberState {
    // 数据状态
    count: number
    id: string | null
    testList: number[]
    
    // UI 状态
    loading: boolean
    error: string | null
    
    // 动作方法
    fetchCountNumber: () => Promise<void>
    incrementCount: () => void
    decrementCount: () => void
    setCount: (value: number) => void
    submitCountNumber: (data: SubmitCountNumberRequestData) => Promise<SubmitCountNumberResponseData>
    clearError: () => void
    reset: () => void
}

// 初始状态
const initialState = {
    count: 0,
    id: null,
    testList: [],
    loading: false,
    error: null,
}

// 创建 store
export const useCountNumberStore = create<CountNumberState>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                // 获取计数数据
                fetchCountNumber: async () => {
                    set({ loading: true, error: null })
                    try {
                        const data = await getCountNumber()
                        set({
                            count: data.number,
                            id: data.id,
                            testList: data.testList,
                            loading: false,
                            error: null,
                        })
                    } catch (error) {
                        set({
                            loading: false,
                            error: error instanceof Error ? error.message : '获取数据失败',
                        })
                    }
                },

                // 增加计数
                incrementCount: () => {
                    const currentCount = get().count
                    set({ count: currentCount + 1 })
                },

                // 减少计数
                decrementCount: () => {
                    const currentCount = get().count
                    set({ count: Math.max(0, currentCount - 1) })
                },

                // 设置计数
                setCount: (value: number) => {
                    set({ count: Math.max(0, value) })
                },

                // 提交计数数据
                submitCountNumber: async (data: SubmitCountNumberRequestData) => {
                    set({ loading: true, error: null })
                    try {
                        const result = await submitCountNumber(data)
                        set({
                            count: result.number,
                            id: result.id,
                            loading: false,
                            error: null,
                        })
                        return result
                    } catch (error) {
                        set({
                            loading: false,
                            error: error instanceof Error ? error.message : '提交数据失败',
                        })
                        throw error
                    }
                },

                // 清除错误
                clearError: () => {
                    set({ error: null })
                },

                // 重置状态
                reset: () => {
                    set(initialState)
                },
            }),
            {
                name: 'count-number-storage', // localStorage key
                partialize: (state) => ({
                    count: state.count,
                    id: state.id,
                    testList: state.testList,
                }), // 只持久化这些字段
            }
        ),
        {
            name: 'count-number-store', // devtools 显示名称
        }
    )
)
