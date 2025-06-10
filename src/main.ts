import axios from 'axios'
import members from '../members.json'
import './style.css'
import { API_KEY, prompt } from './constants'
import type { AnalysisResult } from './type'

const processButton = document.getElementById('process-button')
const loadingLayer = document.getElementById('loading-layer')
const summaryList = document.querySelector('.summary-list')!
const areaList = document.querySelector('.area-list')!
const addArea = document.getElementById('add-area')!

let summaryReports: AnalysisResult[] = []
let areas: HTMLTextAreaElement[] = []
let areaContainers: HTMLDivElement[] = []

processButton &&
	(processButton.onclick = async () => {
		loadingLayer?.classList.add('load')

		const resposnes = await Promise.all(areas.map(item => process(prompt(item.value, members))))
		resposnes.forEach(res => console.log(res))
		summaryReports = resposnes
		summarizeReport()

		loadingLayer?.classList.remove('load')
	})

addArea &&
	(addArea.onclick = () => {
		const container = document.createElement('div')
		const textarea = document.createElement('textarea')
		const deleteButton = document.createElement('button')

		container.className = 'report-text-area-container'

		deleteButton.classList.add('delete-area-button')
		deleteButton.textContent = 'Delete'
		deleteButton.onclick = () => {
			container.remove()
			areas = areas.filter(item => item !== textarea)
			areaContainers = areaContainers.filter(item => item !== container)
			summarizeReport()
		}

		textarea.id = 'report-text-area'
		textarea.className = 'report-text-area'
		textarea.placeholder = 'Quẳng nội dung report của bạn vào đây'

		container.appendChild(textarea)
		container.appendChild(deleteButton)
		areas.push(textarea)
		areaContainers.push(container)
		areaList.innerHTML = ''

		areaContainers.forEach(item => {
			areaList.appendChild(item)
		})

		summarizeReport()
	})

async function process(prompt: string) {
	try {
		const response = await axios.post(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${API_KEY}`,
			{
				contents: [
					{
						parts: [{ text: prompt }],
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
		return result
	} catch (err) {
		loadingLayer?.classList.remove('load')
		throw err
	}
}

function summarizeReport() {
	const summary = summaryReports
		.map(item => {
			return `
		<h3>Thread name:</h3> 
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
