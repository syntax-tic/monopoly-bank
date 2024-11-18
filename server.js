const express = require('express');
const http = require('http'); 
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const fs = require('fs');

const users = {}; // Store users and their balances, credit card no., cvv, loan amount
const transactions = []; // Store transaction history
app.use(express.static('public')); // Serve static files from the 'public' directory

let cardNames = {
  0 : {
      title : 'GUWAHATI',
      owner: 'Bank',
      color:'brown',
      price : 60,
  },
  1:{
  title: 'BHUBANESWAR',
  owner: 'Bank',
  color: 'brown',
  price : 60,
  },
  2:{
  title: 'CHENNAI CENTRAL RAILWAY STATION',
  owner: 'Bank',
  color: 'black',
  price : 200
  },
  3:{
  title: 'PANAJI (GOA)',
  owner: 'Bank',
  color: '#87CEEB',
  price : 100,
  },
  4:{
  title: 'AGRA',
  owner: 'Bank',
  color: '#87CEEB',
  price :100,
  },
  5:{
      title: 'VADODARA',
      owner: 'Bank',
      color: '#87CEEB',
      price: 120,
  },
  6:{
  title: 'LUDHIANA',
  owner: 'Bank',
  color: '#FF00FF',
  price : 140,
  },
  7:{
  title: 'ELECTRIC COMPANY',
  owner: 'Bank',
  color: 'transparent',
  price: 150,
  },
  8:{
  title: 'PATNA',
  owner: 'Bank',
  color: '#FF00FF',
  price : 140
  },
  9:{
  title: 'Bhopal',
  owner: 'Bank',
  color: '#FF00FF',
  price : 160
  },
  10:{
  title: 'HOWRAH RAILWAY STATION',
  owner: 'Bank',
  color: 'black',
  price : 200,
  },
  11:{
  title: 'INDORE',
  owner: 'Bank',
  color: 'orange',
  price : 180,
  },
  12:{
  title: 'NAGPUR',
  owner: 'Bank',
  color: 'orange',
  price : 180,
  },
  13:{
  title: 'KOCHI',
  owner: 'Bank',
  color: 'orange',
  price : 200,
  },
  14:{
  title: 'LUCKNOW',
  owner: 'Bank',
  color: 'red',
  price : 220,
  },
  15:{
  title: 'CHANDIGARH',
  owner: 'Bank',
  color: 'red',
  price : 220,
  },
  16:{
  title: 'JAIPUR',
  owner: 'Bank',
  color: 'red',
  price : 240,
  },
  17:{
  title: 'NEW DELHI RAILWAY STATION',
  owner: 'Bank',
  color: 'black',
  price : 200,
  },
  18:{
  title: 'PUNE',
  owner: 'Bank',
  color: 'yellow',
  price : 260,
  },
  19:{
      title: 'HYDERABAD',
      owner: 'Bank',
      color: 'yellow',
      price : 260,
  },
  20:{
      title: 'WATER WORKS',
      owner: 'Bank',
      color: 'transparent',
      price : 150,
  },
  21:{
      title: 'AHMEDABAD',
      owner: 'Bank',
      color: 'yellow',
      price : 280,
  },
  22:{
  title: 'KOLKATA',
  owner: 'Bank',
  color: 'green',
  price : 300,
  },
  23:{
      title: 'CHENNAI',
      owner: 'Bank',
      color: 'green',
      price : 300,
  },
  24:{
      title: 'BENGALURU',
      owner: 'Bank',
      color: 'green',
      price : 320,
  },
  25:{
  title: 'CHATRAPATHI SHIVAJI TERMINUS',
  owner: 'Bank',
  color: 'black',
  price : 200,
  },
  26:{
  title: 'DELHI',
  owner: 'Bank',
  color: 'blue',
  price : 350,
  },
  27:{
  title: 'MUMBAI',
  owner: 'Bank',
  color: 'blue',
  price : 400,
  },
}

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('saveCurrentGame', ()=>{
    socket.emit('savingCurrentGame', users, cardNames, transactions);
  })
  socket.on('getCards', ()=>{
    socket.emit('updateCardNames' ,cardNames);
  });
  socket.on('getProperty', (key,usr)=>{
    if(users[usr].balance<cardNames[key].price)
      socket.emit('error', 'Less Balance');
    else{
      users[usr].balance -= cardNames[key].price;
      cardNames[key].owner = usr;
      const transaction = `<strong>${usr}</strong> bought <strong>${cardNames[key].title}</strong> for <strong>${cardNames[key].price}</strong> on ${new Date().toLocaleString()}`;
      transactions.unshift(transaction);
      const speak = `${usr} bought ${cardNames[key].title} for ${cardNames[key].price}.`;
      io.emit('updateCardNames', cardNames);
      io.emit('updateUsers', users);
      io.emit('transactionHistory', transactions);
      io.emit('updateBalance', users);
      socket.emit('playSound');
      socket.emit('playVoice', speak);
    }
  })
  socket.on('getLoanAmt', (usr, interest, amt, existingAmt)=>{
    users[usr].loanAmt =  existingAmt + amt + interest/100*amt;
    users[usr].balance+=amt;
    const transaction = `<strong>${usr}</strong> took a loan of <strong>${amt}</strong> with interest of <strong>${interest}%</strong> on ${new Date().toLocaleString()}`;
    const speak = `${usr} took a loan of ${amt}with interest of ${interest}%`
    transactions.unshift(transaction);
    io.emit('updateUsers', users);
    io.emit('transactionHistory', transactions);
    io.emit('updateBalance', users);
    socket.emit('updateLoanDetails', users);
    socket.emit('playSound');
    socket.emit('playVoice', speak);
  });

  socket.on('rollDice', ()=>{
            const xRand1 = getRandomInt(4, 12) * 90; // Random multiple of 90 degrees
            const yRand1 = getRandomInt(4, 12) * 90; // Random multiple of 90 degrees
            const xRand2 = getRandomInt(4, 12) * 90; // Random multiple of 90 degrees
            const yRand2 = getRandomInt(4, 12) * 90; // Random multiple of 90 degrees
            function getRandomInt(min, max) {
              min = Math.ceil(min);
              max = Math.floor(max);
              return Math.floor(Math.random() * (max - min + 1)) + min;
          }
    io.emit('rollAll', xRand1,yRand1, xRand2,yRand2);
  })

  socket.on('payLoanAmt', (usr, amt, existingAmt)=>{
    users[usr].loanAmt = existingAmt - amt;
    users[usr].balance-=amt;
    const transaction = `<strong>${usr}</strong> payed a loan amount of <strong>${amt}</strong> on ${new Date().toLocaleString()}`;
    transactions.unshift(transaction);
    const speak = `${usr} payed a loan amount of ${amt}`;
    io.emit('updateUsers', users);
    io.emit('transactionHistory', transactions);
    io.emit('updateBalance', users);
    socket.emit('updateLoanDetails', users);
    socket.emit('playSound');
    socket.emit('playVoice', speak);
  })
  socket.on('reloadThings', ()=>{
    io.emit('updateUsers', users);
    io.emit('transactionHistory', transactions);
    io.emit('updateBalance', users);
    socket.emit('updateCardNames', cardNames);
    socket.emit('updateLoanDetails', users);
  });
  socket.on('payBank', (usr, amt, rem)=>{
    if(amt&&users[usr].balance>=amt){
      users[usr].balance-=amt;
      let transaction;
      let speak;
      if(rem!=''){
       transaction = `<strong>${usr}</strong> payed <strong>${amt}</strong> to <strong>Bank</strong> on ${new Date().toLocaleString()} : <strong>${rem}</strong>`;
       speak = `${usr} payed ${amt} to Bank. Reason: ${rem}`;
      }
      else{
        transaction = `<strong>${usr}</strong> payed <strong>${amt}</strong> to <strong>Bank</strong> on ${new Date().toLocaleString()}`;
       speak = `${usr} payed ${amt} to Bank`;
      } 
      transactions.unshift(transaction);
      io.emit('updateUsers', users);
      io.emit('transactionHistory', transactions);
      io.emit('updateBalance', users);
      socket.emit('playSound');
      socket.emit('playVoice', speak);
      }else{
        socket.emit('error', `Transaction failed, check balance or amount entered`);
      }
  })
  socket.on('salary', (usernameInput)=>{
    users[usernameInput].balance += 200;
    let transaction, speak;
     transaction = `<strong> ${usernameInput} </strong> received <strong>200</strong> as salary on ${new Date().toLocaleString()}`;
     speak = `${usernameInput} received 200 as salary`;
    transactions.unshift(transaction);
    io.emit('updateUsers', users);
    io.emit('transactionHistory', transactions);
    io.emit('updateBalance', users);
    socket.emit('playSound');
    socket.emit('playVoice', speak);
  });
  socket.on('requestProperty', (key, usr)=>{
    let toId = users[cardNames[key].owner].id;
    socket.to(toId).emit('confirmPropertyRequest', `${usr} is requesting to claim the membership for the property : ${cardNames[key].title}`, key, usr);
  })
  socket.on('approvedPropertyRequest', (oldUsr, newUsr, key, confirmation)=>{
    if(confirmation){
    cardNames[key].owner = newUsr;
    const transaction = `<strong>${oldUsr}</strong> transferred <strong>${cardNames[key].title}</strong> to <strong>${newUsr}</strong> on ${new Date().toLocaleString()}.`
    const speak = `${oldUsr} transferred ${cardNames[key].title} to ${newUsr}.`
    transactions.push(transaction);
    io.emit('transactionHistory', transactions);
    socket.emit('playSound');
    socket.emit('playVoice', speak);
    io.emit('updateCardNames', cardNames);
    }
    else{
      socket.to(users[newUsr].id).emit('error', `${oldUsr} denied your property ownership request.`);
    }
  })
  socket.on('register',  (usr, credit_card, cvv)=>{
  if (!users[usr]) {
     users[usr] = { id: socket.id,credit_card: credit_card, cvv: cvv, balance: 1500,loanAmt: 0 }; 
    console.log(`${usr} registered with initial balance ${users[usr].balance}`);
  }
   io.emit('updateUsers', users);
  socket.emit('showDetails');
  socket.emit('updateBalance', users);
  });
  socket.on('receiveMoney', (usr, amt, rem)=>{
    if(amt){
    users[usr].balance+=amt;
    let transaction, speak;
    if(rem!=''){
    transaction = `<strong>${usr}</strong> received <strong>${amt}</strong> from <strong>Bank</strong> on ${new Date().toLocaleString()} : <strong>${rem}</strong>`;
    speak = `${usr} received ${amt} from Bank. Reason: ${rem}`;
    }
    else{
      transaction = `<strong>${usr}</strong> received <strong>${amt}</strong> from <strong>Bank</strong> on ${new Date().toLocaleString()} `;
    speak = `${usr} received ${amt} from Bank.`;
    }
    transactions.unshift(transaction);
    io.emit('updateUsers', users);
    io.emit('transactionHistory', transactions);
    io.emit('updateBalance', users);
    socket.emit('playSound');
    socket.emit('playVoice', speak);
    }else{
      socket.emit('error', `Amount can't be blank`);
    }
  });
  socket.on('sendMoney', (data, rem) => {
    const { from, to, amount } = data;
    if (users[from] && users[to] && users[from].balance >= amount && amount!=null) {
      users[from].balance -= amount;
      users[to].balance += amount;
      let transaction, speak;
      if(rem!=''){
       transaction = `<strong>${from}</strong> sent <strong>${amount}</strong> to <strong>${to}</strong> on ${new Date().toLocaleString()} : <strong>${rem}</strong>`;
       speak = `${from} sent ${amount} to ${to}. Reason: ${rem}`;
      }
      else{
        transaction = `<strong>${from}</strong> sent <strong>${amount}</strong> to <strong>${to}</strong> on ${new Date().toLocaleString()} `;
       speak = `${from} sent ${amount} to ${to}.`;
      }
      transactions.unshift(transaction);
      io.emit('updateUsers', users);
      io.emit('transactionHistory', transactions);
      io.emit('updateBalance', users);
      socket.emit('playSound');
      socket.emit('playVoice', speak);
    } else {
      socket.emit('error', 'Transaction failed');
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
