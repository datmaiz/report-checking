export type AnalysisResult = {
	thread_name: string
	reported_users: string[]
	not_reported_users: string[]
	total_members: number
	reported_count: number
	not_reported_count: number
	warnings: {
		member: string
		warning_message: string
		reason?: string
	}[]
}
