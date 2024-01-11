const APIkey = 'live_Ja49O9NZ8ulTF9O4C5JYRaDzN8Z0tgGo5sS92CJQIM9ThOttYiducH6xJKfJDM5W';
const URL = ' https://api.thecatapi.com/v1/';
const btnRefreshCat = document.querySelector('#refreshCat');
const btnNewFavoriteCat = document.querySelector('#newFavoriteCat');
const catImage = document.querySelector('.catImage');
let user = localStorage.getItem('user');
let currentCat;

async function getCat(){
	const response = await fetch(URL+'images/search');
	const cat = await response.json();
	return cat;
}

async function getFavs(){
	const response = await fetch(URL+`favourites?limit=9&sub_id=user-123&order=DESC`,{
    headers:{
      "content-type":"application/json",
      'x-api-key': APIkey,
    }
  });
	const favs = await response.json();
	console.log(favs);
}

async function setFav(){
  console.log(currentCat);

  const rawBody = JSON.stringify({ 
    "image_id":currentCat,
    "sub_id":user
  });
    
  const newFavourite = await fetch(URL+`favourites`, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APIkey
      },
      body: rawBody,
    }
  )
  console.log('nuevo gato favorito',newFavourite);  
  showCat();
}

async function showCat(){
	const cat = await getCat();
  currentCat = cat[0].id;
  console.log(cat[0]);
	catImage.style.backgroundImage = `url('${cat[0].url}')`; 
}

function generateUID(){
  const randomNum = Math.random().toString(36).substring(2);
  const timestamp = (new Date()).getTime().toString(36);
  const uid = randomNum + timestamp;

  return uid;
}

function main() {
	showCat();

  if(!user){
    localStorage.setItem('user',generateUID());
    user = localStorage.getItem('user');
  }

  console.log(user);
}

function handleClickShowCat(){
	showCat();
}

function handleClickNewFavoriteCat() {
  setFav();
}

btnRefreshCat.addEventListener('click',handleClickShowCat);
btnNewFavoriteCat.addEventListener('click',handleClickNewFavoriteCat);


main();
