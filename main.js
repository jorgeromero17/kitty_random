const URL = ' https://api.thecatapi.com/v1/images/search';
const btn = document.querySelector('button');
const catImage = document.querySelector('.catImage');

async function getCat(){
	const response = await fetch(URL);
	const cat = response.json();
	return cat;
}

async function showCat(){
	const cat = await getCat();
	catImage.style.backgroundImage = `url('${cat[0].url}')`; 
}

function handleClickShowCat(){
	showCat();
}


btn.addEventListener('click',handleClickShowCat);


showCat();