const APIkey = 'live_Ja49O9NZ8ulTF9O4C5JYRaDzN8Z0tgGo5sS92CJQIM9ThOttYiducH6xJKfJDM5W';
const URL = ' https://api.thecatapi.com/v1/';
const btnRefreshCat = document.querySelector('#refreshCat');
const btnNewFavoriteCat = document.querySelector('#newFavoriteCat');
const btnUploadCat = document.querySelector('#uploadCat');
const spinnerUploadCat = document.querySelector('#spinnerUploadCat');
const btnRemoveContribution = document.querySelector('#removeContribution');
const inputFile = document.querySelector('input');
const catImage = document.querySelector('.catImage');
let breeds;
let user = localStorage.getItem('user');
let currentCat;
let currentIndex = 0;
let imagesSlider = '';

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

async function getBreeds(){
  try {
    const select = document.querySelector('#searchBreed');
    
    const response = await fetch(URL+'breeds');
    breeds = await response.json();
    
    console.log(breeds)
    
    breeds.forEach(breed => {
      const {id,name} = breed;
      const option = document.createElement('option');
      option.value =  id;
      option.innerHTML = name;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.log(error)
  } finally {
    searchSelectedBreed('abys');
  }
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
        'X-API-KEY': APIkey
      },
      body: rawBody,
    }
  ) 
  showCat();
  showFavoritesCats();
}

async function getFavoriteCats(){
	const response = await fetch(URL+`favourites?sub_id=${user}&order=DESC`,{
    headers:{
      "Content-Type":"application/json",
      'X-API-KEY': APIkey,
    }
  });
	
  const favs = await response.json();

  return favs;
}

async function removeFavoriteCat(id){
  const response = await fetch(URL+`favourites/${id}`, {
    method:'DELETE',
    headers:{
      "Content-Type":"application/json",
      'X-API-KEY': APIkey,
    }
  });

  const deleted = await response.json();
  console.log(deleted);
  showFavoritesCats();
}

async function removeUploadedCat(id){
  try {
    const response = await fetch(URL+`images/${id}`, {
      method:'DELETE',
      headers:{
        "Content-Type":"application/json",
        'X-API-KEY': APIkey,
      }
    });
  } catch (error) {
    console.log(error);
  } finally {
    showUploadedCats();
  }
}

async function uploadCat(){
  const form = document.querySelector('#uploadingForm');
  const formData = new FormData(form);
  formData.append('sub_id', user);

  try {
    // Desactivar el botón antes de la llamada
    btnUploadCat.style.display = 'none';
    spinnerUploadCat.style.display = 'flex';

    const response = await fetch(URL + 'images/upload', {
      method: 'POST',
      headers: {
        // 'Content-Type': 'multipart/form-data',
        'X-API-KEY': APIkey,
      },
      body: formData,
    });

  } catch (error) {
    console.error('Error al subir la imagen:', error);
  } finally {
    spinnerUploadCat.style.display = 'none';
    handleRemoveContribution();
    showUploadedCats();
  }
}

async function getUploadedCats() {
  const response = await fetch(URL+`images/?limit=10&sub_id=${user}&order=DESC`,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': APIkey,
    }
  }
  );

  const cats = await response.json();
  console.log(cats);
  return cats;
}

async function showCat(){
	const cat = await getCat();
  currentCat = cat[0].id;

	catImage.style.backgroundImage = `url('${cat[0].url}')`; 
}

function clearSection(sectionFavs,gallery) {
  // Eliminar el párrafo existente si hay favoritos
  const existingParagraph = sectionFavs.querySelector('p');
  if (existingParagraph) {
    sectionFavs.removeChild(existingParagraph);
  }

  // Eliminar imágenes existentes
  const existingImages = gallery.querySelectorAll('.itemContainer');
  existingImages.forEach(img => {
    gallery.removeChild(img);
  });
}

function renderCats(section,gallery,cats,message,areFavorites){
  if(cats.length>0){
    cats.forEach(cat => {
      const div = document.createElement('div');
      const img = document.createElement('img');
      const button = document.createElement('button');
      const icon = document.createElement('i');
            
      div.classList.add('itemContainer');
      img.classList.add('item');
      button.classList.add('removeButton');
      icon.classList.add('fa-solid');
      icon.classList.add('fa-xmark');

      if(areFavorites){
        img.src = cat.image.url;
        button.onclick = () => removeFavoriteCat(cat.id);
      } else {
        img.src = cat.url;
        button.onclick = () => removeUploadedCat(cat.id);
      }

      div.appendChild(img);
      div.appendChild(button);
      button.appendChild(icon);
      gallery.appendChild(div);
    });
  } else {
    const p = document.createElement('p');
    p.classList.add('message');
    p.textContent = message;
    section.appendChild(p);
  }
}

async function showFavoritesCats(){
  const cats = await getFavoriteCats();

  const section = document.querySelector('#favs');
  const gallery = document.querySelector('#favoritesGallery');

  clearSection(section,gallery);

  renderCats(section,gallery,cats,"No favorite kitties yet. Time to explore!",true);
}

async function showUploadedCats(){
  const cats = await getUploadedCats();

  const section = document.querySelector('#conts');
  const gallery = document.querySelector('#contributionGallery');

  clearSection(section,gallery);

  renderCats(section,gallery,cats,"No uploaded kitties found. Begin adding your purr-sonal touch!",false);
}

function addButtonsSlider(){
  imagesSlider = document.querySelectorAll('.breedImage');
  const buttonsHTML = `
      <div class="buttonsBreedGallery">
          <button onclick="prevImage()"><i class="fa-solid fa-caret-left"></i></button>
          <button onclick="nextImage()"><i class="fa-solid fa-caret-right"></i></button>
      </div>
  `;

  imagesSlider.forEach( image => image.innerHTML = buttonsHTML);
}

function showImageSlider(index){
  imagesSlider.forEach((image, i) => {
    if (i === index) {
        image.classList.add('active');
    } else {
        image.classList.remove('active');
    }
});
}

async function showBreedInformation({
  id, 
  name, 
  origin, 
  description,
  adaptability,
  affection_level,
  energy_level,
  intelligence,}) {
    const breedGallery = document.querySelector('#breedGallery');
    const breedDescription = document.querySelector('#breedDescription');
    const breedName = document.querySelector('#breedName');
    const traitsContainer = document.querySelector('.traitsContainer');

    let imagesElements = '';
    const traitNames = ['Adaptability', 'Affection Level', 'Energy Level', 'Intelligence'];
    const traits = [adaptability,affection_level,energy_level,intelligence];
    let traitsElements = '';

    const response = await fetch(URL+`images/search?limit=4&breed_ids=${id}`);
    const cats = await response.json();
    console.log(cats);

    cats.forEach(cat => {
      imagesElements += `<div class="breedImage" style="background-image: url('${cat.url}');"></div>`;
    });

    traits.forEach((trait, index) => {
      const width = (parseInt(trait) * 20) + '%';
      traitsElements += `<div class="breedTrait"><label>${traitNames[index]}</label><div><label class="traitLevel" style="width:${width}" ></label></div></div>`;
    });

    breedGallery.innerHTML = imagesElements;
    breedName.innerHTML = `${name}<i id="breedOrigin">(${origin})</i>`;
    breedDescription.innerText = description;
    traitsContainer.innerHTML = traitsElements;
    addButtonsSlider();
    showImageSlider(currentIndex);
}

function searchSelectedBreed(value){
  const selectedBreed = breeds.filter( (breed) => breed.id === value);

  const {
    id, 
    name, 
    origin, 
    description,
    adaptability,
    affection_level,
    energy_level,
    intelligence,} = selectedBreed[0];

  showBreedInformation({
    id, 
    name, 
    origin, 
    description,
    adaptability,
    affection_level,
    energy_level,
    intelligence,});
}

function main() {
	showCat();
  showFavoritesCats();
  showUploadedCats();
  getBreeds();

  if(!user){
    localStorage.setItem('user',generateUID());
    user = localStorage.getItem('user');
  }
}

function handleClickShowCat(){
	showCat();
}

function handleClickNewFavoriteCat() {
  setFav();
}

function handleClickUploadCat() {
  uploadCat();
}

function handleShowButtonSendCat() {

  if (inputFile.files.length > 0) {
    const preview = document.querySelector('#uploadingImgCat');
    const file = inputFile.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      preview.style.display = "block";
      preview.style.backgroundImage = `url('${e.target.result}')`; 
      
      btnUploadCat.style.display = "block";
      const parent = inputFile.parentNode;
      parent.style.display = "none";
    }

    reader.readAsDataURL(file);

  }
}

function handleRemoveContribution() {
  const preview = document.querySelector('#uploadingImgCat');
  const parent = inputFile.parentNode;

  preview.style.display = "none";
  preview.style.backgroundImage = "none";

  btnUploadCat.style.display = "none";

  parent.style.display = "flex";
  inputFile.value = "";
}

function handleSelectChange() {
  const select = document.getElementById('searchBreed');
  const value = select.value;

  searchSelectedBreed(value);
}

function nextImage() {
  currentIndex = (currentIndex + 1) % imagesSlider.length;
  showImageSlider(currentIndex);
}

function prevImage() {
  currentIndex = (currentIndex - 1 + imagesSlider.length) % imagesSlider.length;
  showImageSlider(currentIndex);
}

btnRefreshCat.addEventListener('click',handleClickShowCat);
btnNewFavoriteCat.addEventListener('click',handleClickNewFavoriteCat);
btnUploadCat.addEventListener('click',handleClickUploadCat);
inputFile.addEventListener('change',handleShowButtonSendCat);
btnRemoveContribution.addEventListener('click', handleRemoveContribution);

main();
