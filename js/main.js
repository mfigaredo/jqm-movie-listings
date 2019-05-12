$(document).ready(function(){


    $('body').on('submit', '#searchForm', function(e) {
        e.preventDefault();
        let searchText = $('#searchText').val();
        if(searchText.trim().length>0) {
            // alert(searchText);
            searches = getRecentSearches()
            searches.push(searchText)
            saveRecentSearches(searches)
            getMovies(searchText);
        }
    })

    function setCopyrightDate(){
        year=new Date().getYear();
        if (year<1900)
          year+=1900;
        $("#currentYear").text(year);
        
      }
      
      setCopyrightDate();

    $('div[data-role=footer]').html($('#footer').html())
})



var apikey = 'e5d41b4d';

// Before Movie Details page
$(document).on('pagebeforeshow', '#movie', function(){
    let movieId = sessionStorage.getItem('movieID')
    getMovie(movieId)
})

$(document).on('pagebeforeshow', '#recent', function(){
    let  searches = getRecentSearches().reverse()
    let output = ''
    $.each(searches, function(index, search) {
        output += `<div class="item">${search}</div> `
    })
    $('#recentSearches').html(output)//.listview('refresh')
})

$(document).on('pagebeforeshow', '#favorites-page', function() {
    
    let favorites = getFavorites()
    // console.log('load Favorites')
    // console.log(favorites)
    let output = ''
    $.each(favorites, function(index, favorite){
        added = (favorite.dateAdded != undefined) ? `<p>Added: ${favorite.dateAdded}</p>` : '';
        output += `<li><a onclick="movieClicked('${favorite.id}')" href="#"  data-transition="slide"><h2>${favorite.title}</h2>${added}</a></li>`
    })
    $('#favorites-list').html(output).listview('refresh')
})

$(document).on('click', '#recentSearches .item', function(e){
    var searchTxt = $(this).text()
    // alert(searchTxt);
    $('#searchText').val(searchTxt)
    $('#searchForm').submit()
    $.mobile.changePage('#home')
})

// Single Movie selected
function movieClicked(id) 
{
    // console.log(id)
    sessionStorage.setItem('movieID', id)
    $.mobile.changePage('#movie')
}

// Get Movies OMDB Api
function getMovies(searchText) 
{
    $.ajax({
        method: 'GET',
        url: 'http://www.omdbapi.com/?apikey=' + apikey + '&s=' + searchText,

    }).done(function(data){
        // console.log(data)
        let movies = data.Search
        let output = ''
        $.each(movies, function(index, movie) {
            imgTag = (movie.Poster != 'N/A') ? `<img src="${movie.Poster}" onerror="this.style.display = 'none'">` : '';
            // imgTag = ImageExist(movie.Poster) ? `<img src="${movie.Poster}">` : '';
            output += `
                <li>
                  <a onclick="movieClicked('${movie.imdbID}')" href="#"  data-transition="slide">
                    ${imgTag}
                    <h2 style="white-space:normal;">${movie.Title}</h2>
                    <p>Release Year: ${movie.Year}</p>
                  </a>
                </li> 
            `
        })
        $('#movies').html(output).listview('refresh')
        //$('#home [data-role=header]').trigger('click')
        $.mobile.changePage('#home')
    })

}

// Get single movie
function getMovie(movieId)
{
    //alert(movieId)
    $.ajax({
        method: 'GET',
        url: 'http://www.omdbapi.com?apikey=' + apikey + '&i=' + movieId,
    }).done(function(data){
        // console.log(data)
        let movie = data;
        let movieTop = `
          <div style="text-align:center;">
            <h1>${movie.Title}</h1>
            <img src="${movie.Poster}" onerror="this.style.display = 'none'">
          </div>
        `
        $('#movieTop').html(movieTop)
        let movieDetails = `
            <li><strong>Genre:</strong> ${movie.Genre}</li>
            <li><strong>Rated:</strong> ${movie.Rated}</li>
            <li><strong>Released:</strong> ${movie.Released}</li>
            <li><strong>Runtime:</strong> ${movie.Runtime}</li>
            <li><strong>IMDB Rating:</strong> ${movie.imdbRating}</li>
            <li><strong>IMDB Votes:</strong> ${movie.imdbVotes}</li>
            <li style="white-space:normal;"><strong>Actors:</strong> ${movie.Actors}</li>
            <li style="white-space:normal;"><strong>Director:</strong> ${movie.Director}</li>
        `
        $('#movieDetails').html(movieDetails).listview('refresh')
        localStorage.setItem('jml-current-id', movieId);
        localStorage.setItem('jml-current-title', movie.Title);
        setFavoriteButton();
    })
}

function getRecentSearches() {
    var searches = new Array()
    var searchesStr = localStorage.getItem('jml-searches');
    // console.log('searches Str= [' + searchesStr + ']')
    if(searchesStr != null && searchesStr != '') {
        searches = JSON.parse(searchesStr)
    } else {
        searches = []
    }
    // console.log(searches)
    return searches
}

function saveRecentSearches(searches) {

    var uniqueNames = [];
    $.each(searches, function(i, el){
            if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    searches = uniqueNames;
    while (searches.length > 25) {
        searches.splice(0,1)
    }
    // console.log(searches)
    localStorage.setItem('jml-searches', JSON.stringify(searches))
}

function getFavorites() {
    var favorites = new Array()
    var favoritesStr = localStorage.getItem('jml-favorites');
    // console.log('favorites Str= [' + searchesStr + ']')
    if(favoritesStr != null && favoritesStr != '') {
        favorites = JSON.parse(favoritesStr)
    } else {
        favorites = []
    }
    // console.log(searches)
    return favorites.sort(function(a,b){
        return (a.title > b.title) ? 1: -1;
    })
}

function addToFavorites(id, title) {

    var favorites = getFavorites()
    var existe = false;
    for(var i=0; i<favorites.length; i++) {
        if(favorites[i].id == id) existe = true
    }
    if(!existe) {
        favorites.push({
            id: id, 
            title: title, 
            dateAdded: moment().format('DD/MM/YYYY')
        });
        localStorage.setItem('jml-favorites', JSON.stringify(favorites))
        alert('Favorite Added')
        // console.log(favorites)
    }
}

function removeFromFavorites(id) {
    var favorites = getFavorites()
    for(var i=0; i<favorites.length; i++) {
        if(favorites[i].id == id) {
            favorites.splice(i,1);
        }
    }  
    localStorage.setItem('jml-favorites', JSON.stringify(favorites))
    alert('Favorite Removed')
    // console.log(favorites)     
}

function setFavoriteButton() {
    // if is Favorite add Remove button, else add Add to Favorite button
    $('#movie #favButton').html('');
    var favorites = getFavorites()
    var existe = false
    var id = localStorage.getItem('jml-current-id')
    var title = localStorage.getItem('jml-current-title')
    for(var i=0; i<favorites.length; i++) {
        if(favorites[i].id == id) {
            existe = true
        }
    } 
    if(existe) {
        var button = $('<button/>').text('Remove from Favorites').addClass('ui-btn ui-btn-icon-right ui-icon-delete');
        button.on('click', function(){
            if(confirm('Remove??')) {
                removeFromFavorites(id);
                // alert('Removed')
            }
        })
        button.appendTo('#movie #favButton');
    } else {
        var button = $('<button/>').text('Add To Favorites').addClass('ui-btn ui-btn-icon-right ui-icon-plus');
        button.on('click', function(){
            if(confirm('Add??')) {
                addToFavorites(id, title);
                // alert('Added');
            }
        })
        button.appendTo('#movie #favButton');        
    }
}