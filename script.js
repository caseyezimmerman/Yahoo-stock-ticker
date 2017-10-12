// 1. Give the user the ability to send a stock symbol
// 2. Get the symbol or ticker
// 3. Once submitted make an ajax request to Yahoo 
// 4. Get the response from Yahoo and update the DOM
 
$(document).ready(function(){

	// setItem takes 2 args
	// 1. Name of the var
	// 2. Value to set
	// var watchList = [
	// 	"goog",
	// 	"msft",
	// 	"tsla",
	// 	"tata",
	// 	"race"
	// ];
	// //convert array to a  string for local storage using JSON.stringify()
	// var watchListAsString = JSON.stringify(watchList);
	// console.log(typeof(watchList))
	// console.log(typeof(watchListAsString))

	// // ENTER.... JSON.parse to turn it back into an object for javascript to use
	// var watchListAsAnObjectAgain = JSON.parse(watchListAsString)
	// console.log(watchListAsAnObjectAgain)


	// //local storage can only take strings, so we have to convert arrays/objects to strings using JSON.stringify()
	// localStorage.setItem('watchList', "race")
	// var watchList = localStorage.getItem('watchList');
	// console.log(watchList)

	//get the watch list..if its null they dont have any saved
	var watchList = localStorage.getItem('watchList');
	//if its nnull they dont have anything saved
	if(watchList !== null){
		// if its not null then update their watchlist
		updateWatchList();
	}



	var firstView = true;
	$(".yahoo-finance-form").submit(function(event){
		$(".form-control").html('')
		// $("#ticker").val('')

		//Stop the browser from sending the page on...we handle it
			event.preventDefault()
			// console.log("User submitted the form")
			
			var stockSymbol = $("#ticker").val(); //set value of input into a variable
			// console.log(stockSymbol);

			//building a URL based on whats inside the input box (stockSymbol)
			var url = 'http://query.yahooapis.com/v1/public/yql?q=env%20%27store://datatables.org/alltableswithkeys%27;select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+stockSymbol+'%22)%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json';


			
			$.getJSON(url,function(theDataJSFound){
				
				console.log(theDataJSFound)
				var numFound = theDataJSFound.query.count
				var newRow = '';
				if (numFound > 1){
					//person searched for multiple stocks at once so we need to loop through them
					theDataJSFound.query.results.quote.map((stock)=>{
						newRow += buildRow(stock);
					})
				}else{
					var stockInfo = theDataJSFound.query.results.quote;
					newRow = buildRow(stockInfo);
				}




				// var stockInfo = theDataJSFound.query.results.quote;
		
				// newRow = buildRow(stockInfo); //calling the function buildrow to put the info found into the rows

				if(firstView){
					$("#stock-table-body").html(newRow);
					firstView = false
				}else{
					$("#stock-table-body").append(newRow);
				}


				$('.save-button').click(function(){ //add a click listener to the buttons in the table(save and delete buttons)
					// console.log("user clicked on a button")
					console.log($(this).attr('symbol'))
					//when clicked on save the symbol to local storage
					var stockToSave = $(this).attr('symbol')
					var oldWatchList = localStorage.getItem('watchlist')
					var oldAsJSON = JSON.parse(oldWatchList); //turn current string into array
					
					//if the user has never saved anything there will be nothing to parse. this will return null
					if(oldAsJSON == null){
						oldAsJSON = [];
					}

					//before we push it on the array check if its in the array
					if(oldAsJSON.indexOf(stockToSave) > -1){
						//the stock is already in the list
						//dont return it again
						//so we don't want to do anything
						console.log('Stock already saved')

					}else{
					oldAsJSON.push(stockToSave);
					console.log(oldAsJSON)
					var newWatchListAsString = JSON.stringify(oldAsJSON); //turn array back into a string so we can put it into local storage
					localStorage.setItem('watchlist',newWatchListAsString);
					updateWatchList() //calling update watch list when they save a stock if its not already in their saved stock array
					}
				})

				$('.delete-button').click(function(){
					console.log($(this).attr('symbol'))
					var stockToDelete = $(this).attr('symbol')
					var deleteWatchList = localStorage.getItem('watchlist')
					var deleteWatchListAsArray = JSON.parse(deleteWatchList)
					deleteWatchListAsArray.splice(stockToDelete)
					stockToDeleteAsString = JSON.stringify()
					localStorage.removeItem(stockToDeleteAsString)





				})
			})
		})

	function buildRow(stock){
		console.log(stock)
		if (stock.Change != null){
			if(stock.Change.indexOf('+') > -1){ //asking if we found a plus within Change
				//This means the stock is up
					var classChange = "success";
			}else{
				//stock is down
				var classChange = "danger";
			}

		}else{
			stock.Change = "Market not open"
		}
	

		var newRow = '';
			newRow += '<tr>';
				newRow += `<td>${stock.Symbol}</td>`;
				newRow += `<td>${stock.Name}</td>`;
				newRow += `<td>${stock.Ask}</td>`;
				newRow += `<td>${stock.Bid}</td>`;
				newRow += `<td class="bg-${classChange}">${stock.Change}</td>`;
				newRow += `<td><button symbol=${stock.Symbol} class="btn btn-success save-button">Save</button></td>`
				newRow += `<td><button symbol=${stock.Symbol} class="btn btn-danger delete-button">Delete</button></td>`
			newRow += '</tr>';

		
		
		return newRow
	}




	function updateWatchList(){
		$("#stock-table-saved-body").html("") //resetting the html of body so that all the saved stocks aren't added every time...only the new saved stock is added
		//get the watch list
		var watchList = localStorage.getItem('watchlist');
		//problem is its a string so we need to change it to an object
		var watchListAsJSON = JSON.parse(watchList);
		// console.log(watchList)
		watchListAsJSON.map((symbol,index)=>{  //loops through each element in the array and the one were on will be called symbol
			
			var url = 'http://query.yahooapis.com/v1/public/yql?q=env%20%27store://datatables.org/alltableswithkeys%27;select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+symbol+'%22)%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json';
			$.getJSON(url, (stockData)=>{
				var stockInfo = stockData.query.results.quote;
				var newRow = buildRow(stockInfo)
				$("#stock-table-saved-body").append(newRow)
			})
			// console.log(symbol)
		})
	}
	




	$("#reset").click(function(){
		reset();
	})

	function reset(){
		document.location.reload();
				
	}


});


