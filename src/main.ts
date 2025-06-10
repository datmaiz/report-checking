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
