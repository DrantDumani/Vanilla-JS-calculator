window.addEventListener("keydown", keyboardInput)

function keyboardInput(event){
	const legend = {
		"ArrowUp": "+/-",
		"0": "0",
		"1": "1",
		"2": "2",
		"3": "3",
		"4": "4",
		"5": "5",
		"6": "6",
		"7": "7",
		"8": "8",
		"9": "9",
		"Enter": "=",
		"+": "+",
		"-": "-",
		"*": "*",
		"/": "/",
		"^": "^",
		".": ".",
		"Backspace": "del",
		"Delete": "AC",
	}

	let clickable = document.evaluate(`//button[text()='${legend[event.key]}']`, document, null, XPathResult.ANY_TYPE, null).iterateNext()
	if (clickable){
		clickable.click()
	}
}

let inputData = []
let display = document.querySelector(".history")
let currentVal = document.querySelector(".inputs")
let precedeByOp = false

console.log(getComputedStyle(currentVal).width)

function init(char = ""){
	currentVal.textContent = char
	inputData = []
	display.textContent = ""
}

function handleDivideByZero(){
	init("FATAL ERROR")
}

let buttons = document.querySelectorAll("button")

for (let button of buttons){
	button.addEventListener("click", clickCalcBttn)
}

const operations = {
	"+": {
		fn: (x,y) => x + y,
		priority: 1
	},
	"-" : {
		fn: (x,y) => x - y,
		priority: 1,
	},
	"*" : {
		fn: (x,y) => x * y,
		priority: 2,
	},
	"/" : {
		fn: (x,y) => x / y,
		priority: 2,
	},
	"^": {
		fn: (x,y) => x**y,
		priority: 3
	}
}

const ops = Object.keys(operations)

function operate(arr){
	let copyArr = [...arr]
	while (copyArr.length !== 1){
		let currentOrder = Math.max(...copyArr.filter(el => ops.includes(el)).map(el => operations[el].priority))
		for (let i = 0; i < copyArr.length; i++){
			let el = copyArr[i]
			if (ops.includes(el) && operations[copyArr[i]].priority === currentOrder){
				if (el === "/" && copyArr[i+1] === "0"){
					handleDivideByZero()
					return
				}
				let num1 = Number(copyArr[i-1])
				let num2 = Number(copyArr[i+1])
				let resNum = operations[el].fn(num1, num2)
				copyArr.splice(i-1, 3, resNum)
				break;
			}
		}
	}
	let numStr = copyArr[0]
	if (numStr.toString().length > 12){
		numStr = new Intl.NumberFormat(undefined, {
			notation: "scientific"
		}).format(numStr)
	}
	currentVal.textContent = numStr
	arr.push("=")
	display.textContent = arr.join(" ")
}

function clickCalcBttn(event) {
	if (currentVal.textContent === "FATAL ERROR") currentVal.textContent = ""
	let char = event.target.textContent

	let currentValStr = currentVal.textContent

	switch(char){
		case "0": case "1": case "2": case "3": case "4": case "5":
		case "6": case "7": case "8": case "9": case ".":
			if (precedeByOp === true) {
				currentVal.textContent = ""
				precedeByOp = false
			}
			if (inputData[inputData.length-1] === "=") init()
			if (char === "."){
				if (!currentValStr.includes(".")) currentVal.textContent += currentVal.textContent === "" ? "0." : "."
			}
			else {
				currentValStr !== "0" ? currentVal.textContent += char : currentVal.textContent = char
			}
			break
		case "+": case "-": case "*": case "/": case "^":
			if (inputData[inputData.length-1] === "=") {
				inputData = []
			}
			if (precedeByOp) inputData[inputData.length - 1] = char
			else if (currentValStr.length !== 0){
				inputData.push(currentValStr, char)
				precedeByOp = true
			}
			display.textContent = inputData.join(" ")
			break
		case "del":
			if (inputData[inputData.length-1] === "=") init()
			else if (currentValStr.length > 0) {
				currentVal.textContent = currentValStr.match(/^-\d$/g) ? "" : currentValStr.slice(0,-1)
			}
			break
		case "+/-":
			if (inputData[inputData.length-1] === "=") init()
			if (currentValStr.length > 0){
				currentVal.textContent = currentValStr[0] === "-" ? currentValStr.slice(1, Infinity) : `-${currentValStr}`
				precedeByOp = false
			}
			break
		case "AC":
			init()
			break
		case "=":
			if (currentValStr.length > 0 && !inputData.includes("=")){
				inputData.push(currentValStr)
				operate(inputData)
			}
	}
	if (currentVal.textContent.length > 12){
		currentVal.textContent = currentVal.textContent.slice(0,12)
	}
	if (display.textContent.length > 23){
		display.textContent = display.textContent.slice(-23)
	}
}