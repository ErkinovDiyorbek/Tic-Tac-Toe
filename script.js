// DOM elementlari
const boardElement = document.getElementById('board')
const statusText = document.getElementById('status')
const difficultySelect = document.getElementById('difficultySelect')
const playerXScoreElement = document.getElementById('playerXScore')
const playerOScoreElement = document.getElementById('playerOScore')
const playerXLabel = document.getElementById('playerXLabel')
const playerOLabel = document.getElementById('playerOLabel')
const singlePlayerBtn = document.getElementById('singlePlayerBtn')
const multiPlayerBtn = document.getElementById('multiPlayerBtn')
const gameSettings = document.getElementById('gameSettings')
const modal = document.getElementById('modal')
const modalTitle = document.getElementById('modalTitle')
const modalMessage = document.getElementById('modalMessage')

// O'yin holati
let board = Array(9).fill('')
let currentPlayer = 'X'
let gameActive = true
let difficulty = 'easy'
let gameMode = 'single' // 'single' yoki 'multi'
let scores = { X: 0, O: 0 }

// G'olib kombinatsiyalari
const winningCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8], // Gorizontal
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8], // Vertikal
	[0, 4, 8],
	[2, 4, 6], // Diagonal
]

// Dastur yuklanganda
document.addEventListener('DOMContentLoaded', () => {
	createBoard()
	updateScores()

	// Qiyinlik darajasini o'zgartirish
	difficultySelect.addEventListener('change', () => {
		difficulty = difficultySelect.value
		resetGame()
	})

	// O'yin rejimini o'zgartirish
	singlePlayerBtn.addEventListener('click', () => {
		if (gameMode !== 'single') {
			setGameMode('single')
		}
	})

	multiPlayerBtn.addEventListener('click', () => {
		if (gameMode !== 'multi') {
			setGameMode('multi')
		}
	})
})

// O'yin rejimini o'rnatish
function setGameMode(mode) {
	gameMode = mode

	if (mode === 'single') {
		singlePlayerBtn.classList.add('active')
		multiPlayerBtn.classList.remove('active')
		gameSettings.style.display = 'flex'
		playerXLabel.textContent = 'Foydalanuvchi (X)'
		playerOLabel.textContent = 'Kompyuter (O)'
	} else {
		singlePlayerBtn.classList.remove('active')
		multiPlayerBtn.classList.add('active')
		gameSettings.style.display = 'none'
		playerXLabel.textContent = '1-oʻyinchi (X)'
		playerOLabel.textContent = '2-oʻyinchi (O)'
	}

	resetGame()
}

// O'yin taxtasini yaratish
function createBoard() {
	boardElement.innerHTML = ''
	board.forEach((cell, index) => {
		const cellElement = document.createElement('div')
		cellElement.classList.add('cell')
		if (cell === 'X') cellElement.classList.add('x')
		if (cell === 'O') cellElement.classList.add('o')
		cellElement.addEventListener('click', () => handleClick(index))
		cellElement.textContent = cell
		boardElement.appendChild(cellElement)
	})
}

// Katakchaga bosilganda
function handleClick(index) {
	if (board[index] !== '' || !gameActive) return

	// Agar kompyuter rejimi bo'lsa va kompyuter navbatida bo'lsa, cheklash
	if (gameMode === 'single' && currentPlayer === 'O') return

	board[index] = currentPlayer
	updateBoard()

	if (checkWinner()) return

	// O'yinchi navbatini almashtirish
	currentPlayer = currentPlayer === 'X' ? 'O' : 'X'
	statusText.textContent = `${currentPlayer} navbati`

	// Agar kompyuter rejimi bo'lsa va kompyuter navbatida bo'lsa
	if (gameMode === 'single' && currentPlayer === 'O' && gameActive) {
		statusText.textContent = `Kompyuter yurmoqda...`
		setTimeout(computerMove, 500 + Math.random() * 500)
	}
}

// Kompyuter yurishi (faqat single rejimida)
function computerMove() {
	if (!gameActive || gameMode !== 'single') return

	let move

	// Qiyinlik darajasiga qarab yurish tanlash
	switch (difficulty) {
		case 'easy':
			move = getRandomMove()
			break

		case 'medium':
			if (Math.random() < 0.7) {
				// 70% aqlli harakat
				move = bestMove()
			} else {
				move = getRandomMove()
			}
			break

		case 'hard':
			// 90% aqlli harakat, 10% tasodifiy
			if (Math.random() < 0.9) {
				move = bestMove()
			} else {
				move = getRandomMove()
			}
			break
	}

	board[move] = 'O'
	updateBoard()

	if (checkWinner()) return

	if (gameActive) {
		currentPlayer = 'X'
		statusText.textContent = `${currentPlayer} navbati`
	}
}

// Tasodifiy yurish
function getRandomMove() {
	let emptyCells = board
		.map((v, i) => (v === '' ? i : null))
		.filter(v => v !== null)
	return emptyCells[Math.floor(Math.random() * emptyCells.length)]
}

// Eng yaxshi yurish (Minimax algoritmi)
function bestMove() {
	let bestScore = -Infinity
	let move

	for (let i = 0; i < board.length; i++) {
		if (board[i] === '') {
			board[i] = 'O'
			let score = minimax(board, 0, false)
			board[i] = ''

			if (score > bestScore) {
				bestScore = score
				move = i
			}
		}
	}

	return move
}

// Minimax algoritmi
function minimax(b, depth, isMaximizing) {
	let result = checkWinnerMini(b)

	if (result !== null) {
		const scores = { X: -10 + depth, O: 10 - depth, tie: 0 }
		return scores[result]
	}

	if (isMaximizing) {
		let bestScore = -Infinity
		for (let i = 0; i < b.length; i++) {
			if (b[i] === '') {
				b[i] = 'O'
				let score = minimax(b, depth + 1, false)
				b[i] = ''
				bestScore = Math.max(score, bestScore)
			}
		}
		return bestScore
	} else {
		let bestScore = Infinity
		for (let i = 0; i < b.length; i++) {
			if (b[i] === '') {
				b[i] = 'X'
				let score = minimax(b, depth + 1, true)
				b[i] = ''
				bestScore = Math.min(score, bestScore)
			}
		}
		return bestScore
	}
}

// G'olibni tekshirish (minimax uchun)
function checkWinnerMini(b) {
	for (let combo of winningCombos) {
		const [a, b1, c] = combo
		if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
			return b[a]
		}
	}

	if (!b.includes('')) return 'tie'
	return null
}

// G'olibni tekshirish
function checkWinner() {
	// G'olib kombinatsiyalarini tekshirish
	for (let combo of winningCombos) {
		const [a, b1, c] = combo
		if (board[a] && board[a] === board[b1] && board[a] === board[c]) {
			// G'olib kataklarini ajratib ko'rsatish
			document.querySelectorAll('.cell').forEach((cell, i) => {
				if (i === a || i === b1 || i === c) {
					cell.classList.add('winner')
				}
			})

			gameActive = false

			// G'olib aniqlash
			const winner = board[a]
			scores[winner]++
			updateScores()

			// Modal oynada g'olibni ko'rsatish
			let winnerMessage = ''
			if (gameMode === 'single') {
				winnerMessage = winner === 'X' ? 'Siz yutdingiz!' : 'Kompyuter yutdi.'
			} else {
				winnerMessage =
					winner === 'X' ? '1-oʻyinchi yutdi!' : '2-oʻyinchi yutdi!'
			}

			statusText.textContent = `${
				winner === 'X'
					? gameMode === 'single'
						? 'Siz'
						: '1-oʻyinchi'
					: gameMode === 'single'
					? 'Kompyuter'
					: '2-oʻyinchi'
			} gʻolib boʻldi!`

			// Konfetti animatsiyasi (faqat foydalanuvchi yutganda)
			if (winner === 'X') {
				createConfetti()
			}

			showModal(
				`${winner === 'X' ? 'Tabriklaymiz!' : 'Afsuski...'}`,
				winnerMessage
			)

			return true
		}
	}

	// Durrang holati
	if (!board.includes('')) {
		gameActive = false
		statusText.textContent = 'Durrang!'
		showModal('Durrang!', 'Hech kim yutqazmadi!')
		return true
	}

	return false
}

// Taxtani yangilash
function updateBoard() {
	const cells = document.querySelectorAll('.cell')
	board.forEach((val, i) => {
		cells[i].textContent = val
		cells[i].className = 'cell'
		if (val === 'X') cells[i].classList.add('x')
		if (val === 'O') cells[i].classList.add('o')
	})
}

// O'yinni qayta boshlash
function resetGame() {
	board = Array(9).fill('')
	gameActive = true
	currentPlayer = 'X'
	statusText.textContent = 'X navbati'
	createBoard()
}

// Hisobni yangilash
function updateScores() {
	playerXScoreElement.textContent = scores.X
	playerOScoreElement.textContent = scores.O
}

// Modal oynani ko'rsatish
function showModal(title, message) {
	modalTitle.textContent = title
	modalMessage.textContent = message
	modal.classList.add('show')
}

// Modal oynani yopish
function hideModal() {
	modal.classList.remove('show')
}

// Qoidalarni ko'rsatish
function showHowToPlay() {
	let rulesMessage = ''

	if (gameMode === 'single') {
		rulesMessage = `Kompyuter bilan o'ynash:\n
			1. Siz "X" belgisi bilan o'ynaysiz\n
			2. Birinchi navbatda siz boshlaysiz\n
			3. Bir qatorda 3 ta bir xil belgi qo'ygan g'olib bo'ladi\n
			4. Qiyinlik darajasini yuqoridagi menyudan o'zgartirishingiz mumkin`
	} else {
		rulesMessage = `Sherik bilan o'ynash:\n
			1. 1-o'yinchi "X" belgisi bilan boshlaydi\n
			2. 2-o'yinchi "O" belgisi bilan o'ynaydi\n
			3. Navbat bilan katakchalarni to'ldirasiz\n
			4. Bir qatorda 3 ta bir xil belgi qo'ygan g'olib bo'ladi`
	}

	showModal('Oʻyin qoidalari', rulesMessage)
}

// Konfetti animatsiyasi
function createConfetti() {
	const colors = [
		'#6c5ce7',
		'#a29bfe',
		'#00b894',
		'#fdcb6e',
		'#e17055',
		'#d63031',
	]

	for (let i = 0; i < 100; i++) {
		const confetti = document.createElement('div')
		confetti.classList.add('confetti')
		confetti.style.left = Math.random() * 100 + 'vw'
		confetti.style.top = -10 + 'px'
		confetti.style.backgroundColor =
			colors[Math.floor(Math.random() * colors.length)]
		confetti.style.width = Math.random() * 10 + 5 + 'px'
		confetti.style.height = Math.random() * 10 + 5 + 'px'
		confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'

		document.body.appendChild(confetti)

		let angle = Math.random() * 360
		let velocity = Math.random() * 5 + 2
		let rotation = Math.random() * 10
		let rotationSpeed = Math.random() * 0.2 - 0.1

		let posY = -10
		let opacity = 1

		const animate = () => {
			posY += velocity
			angle += 0.1
			rotation += rotationSpeed

			const posX = parseFloat(confetti.style.left) + Math.sin(angle) * 2

			confetti.style.left = posX + 'px'
			confetti.style.top = posY + 'px'
			confetti.style.transform = `rotate(${rotation}deg)`

			if (posY < window.innerHeight * 0.8) {
				opacity = 1
			} else {
				opacity =
					1 - (posY - window.innerHeight * 0.8) / (window.innerHeight * 0.2)
			}

			confetti.style.opacity = opacity

			if (posY < window.innerHeight + 10) {
				requestAnimationFrame(animate)
			} else {
				confetti.remove()
			}
		}

		setTimeout(() => {
			requestAnimationFrame(animate)
		}, i * 20)

		confetti.style.opacity = 1
	}
}
