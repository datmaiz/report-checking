import axios from 'axios'
import members from '../members.json'
import './style.css'
import { API_KEY, prompt } from './constants'
import type { AnalysisResult } from './type'

const processButton = document.getElementById('process-button')
const reportTextArea = document.getElementById('report-text-area') as HTMLTextAreaElement
const loadingLayer = document.getElementById('loading-layer')
const summaryList = document.querySelector('.summary-list')!

let summaryReports: AnalysisResult[] = []

window.onfocus = () => {
	reportTextArea.focus()
}

processButton &&
	(processButton.onclick = async () => {
		loadingLayer?.classList.add('load')
		try {
			const response = await axios.post(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${API_KEY}`,
				{
					contents: [
						{
							parts: [{ text: prompt(reportTextArea?.value, members) }],
						},
					],
				}
			)

			let cleanJson = response.data.candidates[0].content.parts[0].text.trim()

			if (cleanJson.startsWith('```json')) {
				cleanJson = cleanJson.slice(7) // xóa '```json'
			}
			if (cleanJson.endsWith('```')) {
				cleanJson = cleanJson.slice(0, -3) // xóa '```'
			}
			console.log(cleanJson)
			const result = JSON.parse(cleanJson) as AnalysisResult

			summaryReports.push(result)
			console.log(summaryReports)

			loadingLayer?.classList.remove('load')

			summarizeReport()
		} catch (err) {
			loadingLayer?.classList.remove('load')
		}
	})

function summarizeReport() {
	const summary = summaryReports
		.map(item => {
			return `
		<h3>Thread nane:</h3> 
		<p>${item.thread_name}</p>
		<h3>List of not reported users:</h3> 
		<ul>${
			item.not_reported_users.length === 0
				? '<li>None</li>'
				: item.not_reported_users.map(item => `<li>${item}</li>`).toString()
		}</ul>
		<h3>Warnings:</h3> 
		<ul>${
			item.warnings.length === 0
				? '<li>None</li>'
				: item.warnings.map(war => `<li>Member: ${war.member}: ${war.warning_message}</li>`).join('')
		}</ul>
	`
		})
		.join('<hr/>')
	summaryList.innerHTML = summary
}

function createSummaryItem(result: AnalysisResult) {
	const container = document.createElement('div')
	const threadLabel = document.createElement('h3')
	const notReportedUsersLabel = document.createElement('h3')
	const notReportedUsers = document.createElement('ul')
	const warningLabel = document.createElement('h3')
	const warnings = document.createElement('ul')

	container.className = `summary-item ${result.thread_name.split(' ').join('')}`
	threadLabel.className = 'thread-name'
	threadLabel.textContent = result.thread_name
	notReportedUsersLabel.className = 'not-reported-users-label'
	notReportedUsersLabel.textContent = 'List of not reported users:'
	notReportedUsers.className = 'not-reported-users'
	result.not_reported_users.forEach(item => {
		const li = document.createElement('li')
		li.className = 'not-reported-user'
		li.textContent = item
		notReportedUsers.appendChild(li)
	})
	warningLabel.classList = 'warning-label'
	warningLabel.textContent = 'Warnings'
	result.warnings.forEach(war => {
		const li = document.createElement('li')
		li.classList = 'warning-item'
		li.textContent = war.warning_message
		if (war.reason) {
			li.textContent += ` - Reason: ${war.reason}`
		}

		warnings.appendChild(li)
	})

	container.appendChild(threadLabel)
	container.appendChild(notReportedUsersLabel)
	container.appendChild(notReportedUsers)
	if (result.warnings.length > 0) {
		container.appendChild(warningLabel)
		container.appendChild(warnings)
	}

	container.innerHTML = `
		Thread nane: ${result.thread_name}
		List of not reported users: ${result.not_reported_users.length === 0 ? 'None' : result.not_reported_users.toString()}
		Warnings: ${result.warnings.length === 0 ? 'None' : result.warnings.toString()}
	`

	return container
}
