var boxFocused = undefined;
var colourArray = ['#ffffff', '#8888ff', '#88ff88', '#ff8888', 'ffff88'];

function setup()
{
	//Check if any checkboxes were checked in previous loads of thsi page
	let check = localStorage.getItem("doDeepUsage");
	if(check == "true")
	{
		document.getElementById("doDeepUsage").checked = true;
	}

	//to form rows, store which ones are available. Each row adds anything craftable from previous rows.
	let available = {};

	let rowNum = 0;
	while(Object.keys(available).length < Object.keys(data).length)
	{
		document.getElementById("main").appendChild(document.createElement("hr"))
		let rowContainer = document.createElement("div");
		rowContainer.setAttribute("id", "row" + rowNum + "container");
		rowContainer.setAttribute("class", "rowContainer");
		document.getElementById("main").appendChild(rowContainer);

		for(let [key, value] of Object.entries(data))
		{
			let possible = true;
			for(let req of value["recipe"])
			{
				if(available[req] === undefined || available[req] >= rowNum)
				{
					possible = false;
					break;
				}
			}
			if(/*value["recipe"].length && */available[key] === undefined && possible)
			{
				available[key] = rowNum;
				//form html content
				let box = document.createElement("div");
				box.setAttribute("id", key);
				box.setAttribute("class", "row" + rowNum + " modbox");
				box.setAttribute("style", "opacity: 1");
				//Form imgs
				let img = document.createElement("img");
				img.setAttribute("src", "./assets/img/" + value["imgName"] + ".png");
				//Form box title and attach image before text, reward image after text
				let modName = document.createElement("span");
				let text = document.createTextNode(key);
				modName.appendChild(img);
				modName.appendChild(text);
				modName.classList.add("modTitle");
				let rewardSpan = document.createElement("span");
				rewardSpan.setAttribute("class", "rewardSpan");
				for(reward in value["rewards"])
				{
					let rwrdImg = document.createElement("img");
					rwrdImg.setAttribute("src", "./assets/img/HeistReward" + value["rewards"][reward] + ".png");
					rwrdImg.setAttribute("alt", value["rewards"][reward]);
					rewardSpan.appendChild(rwrdImg);
				}
				modName.appendChild(rewardSpan);
				box.appendChild(modName);
				//Form box mod description
				// box.appendChild(document.createElement("br"));
				let mod = document.createElement("span");
				let modtext = document.createTextNode(value["mod"]);
				// mod.appendChild(modtext);
				mod.classList.add("modText");
				box.appendChild(mod);

				//Form bonus box and description
				let bonus = document.createElement("span");
				let bonusText = document.createTextNode(value["bonus"] !== null ? value["bonus"] : "");
				bonus.appendChild(bonusText);
				bonus.classList.add("bonusText");
				box.appendChild(bonus);

				document.getElementById("row" + rowNum + "container").appendChild(box);
				box.addEventListener("mouseover", boxHover);
				box.addEventListener("mouseleave", boxLeave);
				box.addEventListener("click", boxClick);

			}
		}
		rowNum++;
		if(rowNum > 10)
		{
			console.log("LOOPED FOREVER!");
			break;
		}
	}
	document.getElementsByTagName("body")[0].addEventListener("click", bgClick);
	document.getElementById("doDeepUsage").addEventListener("click", () => forceBoxRehighlight(boxFocused))
	drawArrows();
}

function forceBoxRehighlight(boxFocused)
{
	if (boxFocused) {
		highlight(boxFocused);
	}
}
function drawArrows()
{
	//form arrow
	for(let [key, value] of Object.entries(data))
	{
		let self = document.getElementById(key);
		//if it contains at least 1 parent
		if(value["recipe"].length)
		{
			for(let req of value["recipe"])
			{
				let parent = document.getElementById(req);
				let clone = document.getElementById(req + key);
				//If it hasn't been drawn yet
				if(!clone)
				{
					//Set up drawing
					clone = document.createElementNS("http://www.w3.org/2000/svg", 'line');
					clone.setAttribute("style", "stroke: #ffffff; stroke-width: 1; opacity = 1");
					clone.setAttribute("marker-end", "url(#arrow)");

					//Set up getting it again on resize
					clone.classList.add(req.replace(' ', '_'));
					clone.classList.add(key.replace(' ', '_'));
					clone.setAttribute("id", req + key);
				}
				//get and set coords
				let parentRect = parent.getBoundingClientRect();
				let selfRect = self.getBoundingClientRect();
				let x1 = parseFloat(parentRect.x + parentRect.width/2);
				//Offset by scroll amount for smaller windows
				let y1 = parseFloat(parentRect.bottom + document.documentElement.scrollTop - parent.parentElement.parentElement.offsetTop);
				let x2 = parseFloat(selfRect.x + selfRect.width/2);
				let y2 = parseFloat(selfRect.top + document.documentElement.scrollTop - self.parentElement.parentElement.offsetTop);
				clone.setAttribute("x1", x1 + "px");
				clone.setAttribute("y1", y1 + "px");
				clone.setAttribute("x2", x2 + "px");
				clone.setAttribute("y2", y2 + "px");

				//add to screen
				document.getElementById("svgContainer").appendChild(clone);
			}
		}
	}
}

function boxHover(event)
{
	if(!boxFocused)
	{
		highlight(event.target);
	}
}
function highlight(box)
{
	while(!box.classList.contains("modbox"))
	{
		box = box.parentElement;
	}
	let id = box.id;

	//highlight selected box
	box.style.border = "1px solid rgba(255,255,255,1)";

	//mute all arrows
	let arrows = document.getElementsByTagName("line");
	for(let a = 0; a < arrows.length; a++)
	{
		arrows[a].style.opacity = 0.1;
	}
	//Check if we are used anywhere
	for(let [key, value] of Object.entries(data))
	{
		//hide all boxes first
		document.getElementById(key).style.opacity = 0.2;
	// 	//only highlight boxes that use us...
	// 	if(value["recipe"].includes(id))
	// 	{
	// 		let keyr = key.replace(' ', '_');
	// 		let idr = id.replace(' ', '_');
	// 		if(document.getElementsByClassName(keyr + ' ' + idr))
	// 		{
	// 			document.getElementsByClassName(keyr + ' ' + idr)[0].style.opacity = 1;
	// 			document.getElementsByClassName(keyr + ' ' + idr)[0].style.strokeWidth = 2;
	// 		}
	// 		document.getElementById(key).style.opacity = 1;
	// 	}
	}
	//highlight boxes that we use, and that our parents use
	highlightRecurseDown(id, 1);
	highlightRecurse(id, 1);

}
function highlightRecurseDown(id, depth)
{
	document.getElementById(id).style.opacity = 1;
	for(let [key, value] of Object.entries(data))
	{
		//only highlight boxes that use us...
		if(value["recipe"].includes(id))
		{
			let keyr = key.replace(' ', '_');
			let idr = id.replace(' ', '_');
			if(document.getElementsByClassName(keyr + ' ' + idr))
			{
				document.getElementsByClassName(keyr + ' ' + idr)[0].style.opacity = 1;
				document.getElementsByClassName(keyr + ' ' + idr)[0].style.stroke = colourArray[colourArray.length - depth];
				document.getElementsByClassName(keyr + ' ' + idr)[0].style.strokeWidth = 2;
			}
			document.getElementById(key).style.opacity = 1;
			if(document.getElementById("doDeepUsage").checked)
			{
				highlightRecurseDown(key, depth+1);
			}
		}

	}
}
function highlightRecurse(id, height)
{
	document.getElementById(id).style.opacity = 1;
	for(let a = 0; a < data[id]["recipe"].length; a++)
	{
		//replaces are for arrow classes, since classes cannot contain ' ', they contain '_' instead
		let idr = id.replace(' ', '_');
		let parentr = data[id]["recipe"][a].replace(' ', '_');
		//check if arrow with both classes exists (connecting the 2)
		if(document.getElementsByClassName(idr + ' ' + parentr))
		{
			document.getElementsByClassName(idr + ' ' + parentr)[0].style.opacity = 1;
			document.getElementsByClassName(idr + ' ' + parentr)[0].style.stroke = colourArray[height];
			document.getElementsByClassName(idr + ' ' + parentr)[0].style.strokeWidth = 2;
		}
		highlightRecurse(data[id]["recipe"][a], height + 1);
	}
}
function boxLeave()
{
	if(boxFocused === undefined)
	{
		boxes = document.getElementsByClassName("modbox");
		arrows = document.getElementsByTagName("line");
		for(let a = 0; a < boxes.length; a++)
		{
			boxes[a].style.opacity = 1;
			boxes[a].style.border = "1px solid rgba(255,255,255,0)";
		}
		for(let a = 0; a < arrows.length; a++)
		{
			arrows[a].style.opacity = 1;
			arrows[a].style.stroke = "#ffffff";
			arrows[a].style.strokeWidth = 1;
		}
	}
}
function bgClick(event)
{
	let source = event.target;
	if(source.id === "svgContainer")
	{
		boxFocused = undefined;
		boxLeave();
	}
}
function boxClick(event)
{
	boxFocused = undefined;
	boxLeave();
	let box = event.target;
	while(!box.classList.contains("modbox"))
	{
		box = box.parentElement;
	}
	boxFocused = box;
	highlight(box);
}

window.onbeforeunload = function()
{
	localStorage.setItem("doDeepUsage", document.getElementById("doDeepUsage").checked);
}
document.addEventListener('DOMContentLoaded', setup);
window.addEventListener('resize', drawArrows);
