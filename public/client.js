const socket = io();
const sendBtn = document.getElementById('sendBtn');
const usernameInput = document.getElementById('fullname');
const toUserInput = document.getElementById('toUser');
const amountInput = document.getElementById('amount');
const balanceSpan = document.getElementById('balance');
const usersList = document.getElementById('users');
const transactionsList = document.getElementById('transactions');
const usrnm = document.getElementById('usrnm');
const salary = document.getElementById('salary');
const submitBtn = document.getElementById('submit');
const details = document.getElementById('details');
const credit_card = document.getElementById('credit_card');
const cvv = document.getElementById('cvv');
const frm = document.getElementById('frm');
const receiveBtn = document.getElementById('receiveBtn');
const payBankBtn = document.getElementById('payBankBtn');
const reloadBtn = document.getElementById('reloadBtn');
const getLoan = document.getElementById('getLoan');
const interest = document.getElementById('interest');
const loanAmt = document.getElementById('loanAmount');
const loanToBePaid = document.getElementById('loanToBePaid');
const payLoan = document.getElementById('payLoan');
const saveGame = document.getElementById('saveGame');
const remarks = document.getElementById('remarks');
const showCardsBtn = document.getElementById('showCards')

showCardsBtn.addEventListener('click', () => {
  socket.emit('getCards');
  const modal = document.getElementById('modal');
  modal.style.display = 'flex'
})


document.getElementById('roll-button').addEventListener('click', () => {
  socket.emit('rollDice');
});
socket.on('rollAll', (xRand1, yRand1, xRand2, yRand2) => {
  const dice1 = document.getElementById('dice1');
  const dice2 = document.getElementById('dice2');
  dice1.style.transform = `rotateX(${xRand1}deg) rotateY(${yRand1}deg)`;
  dice2.style.transform = `rotateX(${xRand2}deg) rotateY(${yRand2}deg)`;
});
let voices = [];  // Array to store available voices
let utterance = new SpeechSynthesisUtterance();  // Create a SpeechSynthesisUtterance object

// Function to populate available voices
function populateVoices() {
  voices = speechSynthesis.getVoices();
}
// Event listener for when voices change
speechSynthesis.onvoiceschanged = () => {
  populateVoices();  // Populate voices array when voices change
};
// Function to speak the text with the "Catherine" voice
function speak(textToSpeak) {
  if (textToSpeak === '') {
    showToast('No text recognized');
    return;
  }
  // Set text to utterance
  utterance.text = textToSpeak;
  // Choose the "Catherine" voice if available
  let targetVoice = voices.find(voice => voice.name.includes('Google हिन्दी'));
  if (targetVoice) {
    utterance.voice = targetVoice;
  } else {
    targetVoice = voices.find(voice => voice.name.includes('Rishi'));
    utterance.voice = targetVoice;
  }
  // Speak the utterance
  speechSynthesis.speak(utterance);

}
// Handle incoming text-to-speech event from the server
socket.on('playVoice', (textToSpeak) => {
  speak(textToSpeak);  // Trigger speak function when 'playVoice' event is received
});

payLoan.addEventListener('click', () => {
  if (parseFloat(loanAmt.value) > 0 && parseFloat(loanToBePaid.textContent) > 0 && parseFloat(loanAmt.value) <= parseFloat(loanToBePaid.textContent)) {
    socket.emit('payLoanAmt', usernameInput.value, parseFloat(loanAmt.value), parseFloat(loanToBePaid.textContent));
  }
  else showToast('Transaction failed');
  loanAmt.value = '';
  interest.value = '';
})
getLoan.addEventListener('click', () => {
    if (parseFloat(loanToBePaid.textContent) + parseFloat(loanAmt.value) * (parseFloat(interest.value)/100) + parseFloat(loanAmt.value) > 1000) {
    showToast('Maximum loan limit is 1000');
  }
  else if (parseFloat(interest.value) >= 0 && parseFloat(loanAmt.value) > 0 && parseFloat(loanToBePaid.textContent) >= 0) {
    socket.emit('getLoanAmt', usernameInput.value, parseFloat(interest.value), parseFloat(loanAmt.value), parseFloat(loanToBePaid.textContent));
  }
  else showToast('Transaction failed');
  loanAmt.value = '';
  interest.value = '';
});
socket.on('updateLoanDetails', (users) => {
  if (users[usernameInput.value])
    loanToBePaid.textContent = users[usernameInput.value].loanAmt;
});
socket.on('playSound', () => {
  const audio = new Audio('tingting.m4a');
  audio.play();
})
reloadBtn.addEventListener('click', () => {
  socket.emit('reloadThings');
})
payBankBtn.addEventListener('click', () => {
  if (amountInput.value > 0)
    socket.emit('payBank', usernameInput.value, parseFloat(amountInput.value), remarks.value);
  else showToast('Transaction failed!!!');
  amountInput.value = '';
  remarks.value = '';
})
receiveBtn.addEventListener('click', () => {
  if (amountInput.value > 0)
    socket.emit('receiveMoney', usernameInput.value, parseFloat(amountInput.value), remarks.value);
  else showToast('Transaction failed!!!')
  amountInput.value = '';
  remarks.value = '';
})
submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  socket.emit('register', usernameInput.value, credit_card.value, cvv.value);
  document.getElementById('mainTitle').innerHTML = 'Welcome to PAIA Monopoly: Playful Adventure, Infinite Amusement!';
  document.title = 'Welcome to PAIA Monopoly: Playful Adventure, Infinite Amusement!';
});
salary.addEventListener('click', () => {
  socket.emit('salary', usernameInput.value);
});
sendBtn.addEventListener('click', () => {
  const from = usernameInput.value;
  const to = toUserInput.value;
  const amount = parseFloat(amountInput.value);
  if (amount > 0)
    socket.emit('sendMoney', { from, to, amount }, remarks.value);
  else showToast('Transaction failed');
  amountInput.value = '';
  remarks.value = '';
});
socket.on('showDetails', () => {
  details.style.display = 'block';
  frm.style.display = 'none';
});
socket.on('updateUsers', (users) => {
  usersList.innerHTML = '';
  toUserInput.innerHTML = '';
  for (const user in users) {
    const li = document.createElement('li');
    li.textContent = `${user}: ${users[user].balance}`;
    usersList.appendChild(li);
  }
  for (const user in users) {
    if (user == usernameInput.value)
      continue;
    const op = document.createElement('option');
    op.setAttribute('value', user);
    op.textContent = user;
    toUserInput.append(op);

  }
});
socket.on('updateBalance', (users) => {
  // console.log(users[usernameInput.value].balance);
  const bal = users[usernameInput.value].balance;
  balanceSpan.innerHTML = bal;
  let count = 0;
  if (bal == 0 && count == 0) {
    setTimeout(() => {
      speak(`Ha Ha Ha, ${usernameInput.value} has zero balance`);
    }, 2000);
  }
  usrnm.innerHTML = usernameInput.value;
});
socket.on('transactionHistory', (transactions) => {
  transactionsList.innerHTML = '';
  transactions.forEach(transaction => {
    const li = document.createElement('li');
    li.innerHTML = transaction;
    transactionsList.appendChild(li);
  });
});
socket.on('updateCardNames', (cardNames) => {
  const modal = document.getElementById('modal');
  showToastCards(cardNames);
})
function showToast(message) {
  const modal = document.getElementById('modal2');
  const modalMessage = document.getElementById('modal-message2');
  const closeModal = document.querySelector('.close3');
  modalMessage.textContent = message;
  modalMessage.style.color = "green";
  modalMessage.style.textAlign = 'center';
  modal.style.display = 'block';

  closeModal.onclick = () => {
    modal.style.display = 'none';
  }

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}
function showToastCards(cardNames) {
  const modal = document.getElementById('modal');
  const cardDetails = document.getElementById('modal-message');
  const closeModal = document.querySelector('.close2');
  closeModal.onclick = () => {
    modal.style.display = 'none';
  }
  cardDetails.innerHTML = '';
  for (const key in cardNames) {
    if (cardNames.hasOwnProperty(key)) {
      const card = cardNames[key];
      let div = document.createElement('div');
      let btn = document.createElement('button');
      let btn2 = document.createElement('button');
      btn2.innerText = 'Request Ownership';
      btn2.setAttribute('onclick', `claimProperty(${key})`);
      btn.innerText = 'Buy';
      btn.setAttribute('onclick', `buyProperty(${key})`);
      if (card.owner != 'Bank') { btn.disabled = true; btn.classList.add('btn-disabled'); }
      if (card.owner == 'Bank') { btn2.disabled = true; btn2.classList.add('btn-disabled'); }
      if (card.owner == usernameInput.value) { btn2.disabled = true; btn2.classList.add('btn-disabled'); }
      div.className = `card ${card.color === 'black' ? 'dark' : ''}`;
      div.innerHTML = `<strong>Title:</strong> ${card.title}<br><strong>Owner:</strong> ${card.owner}<br><strong>Price:</strong> ${card.price}<br>`;
      div.style.backgroundColor = card.color;
      div.style.margin = '10px';
      div.style.padding = '10px';
      div.append(btn);
      div.append(btn2);
      cardDetails.append(div);
    }
  }
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}
socket.on('error', (message) => {
  showToast(message);
});

function buyProperty(key) {
  socket.emit('getProperty', key, usernameInput.value);
}
function claimProperty(key) {
  socket.emit('requestProperty', key, usernameInput.value);
}
socket.on('confirmPropertyRequest', (msg, key, usr) => {
  let a = confirm(msg);
  socket.emit('approvedPropertyRequest', usernameInput.value, usr, key, a);
});
saveGame.addEventListener('click', () => {
  let p = prompt('Enter the name of the winner');
  if (p) {
    generatePdf('p');
  } else {
    showToast("Game not saved");
  }
});

function generatePdf(winner) {
  let content = document.getElementById('pdfContent');
  // Example: Loop through users and cardNames to generate content
  // Access jsPDF from the window object
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  content.append(`Winner is ${winner}, Congratulations!!`);

  // Capture the content to be converted to PDF using html2canvas
  html2canvas(content).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 size
    const imgHeight = canvas.height * imgWidth / canvas.width;

    // Add image to PDF
    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save PDF
    doc.save('generated-pdf.pdf');
  }).catch(error => {
    console.error('Error capturing canvas:', error);
  });
}

