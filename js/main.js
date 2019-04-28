$(document).ready(function(){

    $('body').on('submit', '#searchForm', function(e) {
        e.preventDefault();
        let searchText = $('#searchText').val();
        // alert(searchText);
        getMovies(searchText);
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
                    <h2>${movie.Title}</h2>
                    <p>Release Year: ${movie.Year}</p>
                  </a>
                </li> 
            `
        })
        $('#movies').html(output).listview('refresh')
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
    })
}