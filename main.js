const APIkey = 'live_Ja49O9NZ8ulTF9O4C5JYRaDzN8Z0tgGo5sS92CJQIM9ThOttYiducH6xJKfJDM5W';
const URL = ' https://api.thecatapi.com/v1/';
const btnRefreshCat = document.querySelector('#refreshCat');
const btnNewFavoriteCat = document.querySelector('#newFavoriteCat');
const catImage = document.querySelector('.catImage');
let user = localStorage.getItem('user');
let currentCat;

function generateUID(){
  const randomNum = Math.random().toString(36).substring(2);
  const timestamp = (new Date()).getTime().toString(36);
  const uid = randomNum + timestamp;

  return uid;
}

async function getCat(){
	const response = await fetch(URL+'images/search');
	const cat = await response.json();
	return cat;
}

async function getFavs(){
	const response = await fetch(URL+`favourites?limit=9&sub_id=${user}&order=DESC`,{
    headers:{
      "content-type":"application/json",
      'x-api-key': APIkey,
    }
  });
	
  const favs = await response.json();

  return favs;
}

async function setFav(){
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
  showCat();
  showFavoritesCats();
}

async function showCat(){
	const cat = await getCat();
  currentCat = cat[0].id;

	catImage.style.backgroundImage = `url('${cat[0].url}')`; 
}

function clearSectionFavs(sectionFavs,gallery) {
  // Eliminar el párrafo existente si hay favoritos
  const existingParagraph = sectionFavs.querySelector('p');
  if (existingParagraph) {
    sectionFavs.removeChild(existingParagraph);
  }

  // Eliminar imágenes existentes
  const existingImages = gallery.querySelectorAll('img');
  existingImages.forEach(img => {
    gallery.removeChild(img);
  });
}

async function showFavoritesCats(){
  const cats = await getFavs();
  
  console.log(cats);
  const gallery = document.querySelector('#gallery');
  const sectionFavs = document.querySelector('#favs');

  clearSectionFavs(sectionFavs,gallery);

  if(cats.length>0){
    cats.forEach(cat => {
      const img = document.createElement('img');
      img.src = cat.image.url;
      img.classList.add('item');
      
      gallery.appendChild(img);
    });
  } else {
    const p = document.createElement('p');
    p.textContent = "You don't have favorites yet...";
    sectionFavs.appendChild(p);
  }
}

function main() {
	showCat();
  showFavoritesCats();

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
