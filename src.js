/*
    List of hints / games in our game in order:

    1. sign in to fire fox account (unlocks next set of menu items) **Done**
    2. 
        a. change background color (gives hint) **Done**
        b. open inspect element puzzle game (gives hint) **Done**
        
        c. internet turns off after 10 refreshses (unlocks no internet page / dino game)
        
        d. fix broken text (gives hint) **Done**
    3.
        c. play dino game (gives hint at score 404 && turns internet back on)

    =============================================================

    stuff to add:
    
    ===Done===
    -score system **Done**
    -Create inspect element **Done**
    -credits **Done**
    
    ===Needs to get done===
    -how to play / help
    -win screen (drawing game with text that says you just wasted (x)secs to play this game.)
    -add music
    -fix overflow url bug & refresh bug

    ===Not Likely==
    -back/forward buttons on bar :(
    -something related to (if enough space):
        a. library (go through bookmarked tabs to find clues)
        b. logins and passwords (go through logins & passwords to find clues)
        c. open file (fish through files to find clues)
        d. print (reveals hidden message in printed page?)
        e. save page as (same as print?)
        f. find in this page (reveals hidden text in page?)
    
    
    ****we are currently at: 7.471kb (slightly worrying)****
*/

//gets icon elements
const puzzle = document.getElementById("puzzle");
const firefox = document.getElementById("firefox");
const js13k = document.getElementById("js13k");
const google = document.getElementById("google");

//get drawering canvas & cursor canvas & text div

//inputs
//---------------
// cursor canvas
//---------------
//text div & icons
//----------------
// drawing canvas

const canvas = document.getElementById("game");
const cursorCanvas = document.getElementById("cursorCanvas");
const t = document.getElementById("text")

//gets context
const ctx = canvas.getContext("2d");

//width & height of game (use these instead of canvas.width/height)
let width = window.innerWidth;
let height = window.innerHeight;


//cursor stuff
let click = false;
let cursor = {x:0,y:0}
let flashingCursor = false;
let flashingCursorX = 1;

//loops
let loop;
let cursorLoop;
let scoreLoop;

//bools for typing, "refreshing" the page and whether or not settigns are displayed
let canType = false;
let refresh = false;
let displaySettings = false;
let fixBrokenText = false;
let isSignedIn = false;
let inspectElemnet = false;

//positions for icons / tab / searchbar / start button
let tabX = 130;
let tabWidth = 250;
    
let iconWH = 15;
let extra = 17;

let searchBarX = tabX+tabWidth/2;
let searchBarW = width*0.7

let startButtonWidth = width*0.7
let startButtonY = (height-90)/3


//tab text, base url, winning url, search bar text
let tabText = "New Tab";
let originURL = "js13kgames.com/secret_games/"
let correctURL = "game#16A14n23"
let searchText = "Search with Google or enter address";
let accountName = "Sign in to Firefox"

let correctColor = ""
let hint1 = "You didn't think it would be that easy did you?"
let hint2 = "";
let winningText = "";

//our color pallet add any colors you may want
let cp = [
    "#333434",//background
    "#EFF0F3",//tab background && plus icon
    "#4da2fe",//tab highlighted color
    "#56565A",//"new tab" text && icon color
    "#FAFAFB",//bar background
    "#B6B4BB",//bar bottom && bar to left of hamburger && search bar color
    "#000000"
];

let backgroundColor = "#ffffff"

//array for bounding boxes
let clickableObjects = [];

//bounding box data
let clickableObjectsData = [];

let highscores;

//bounding box class
class clickableObject{
    constructor(x,y,w,h,e){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.e = e; //e is function to be called
    }
    
    clicked(){
        if(cursor.x > this.x && cursor.x < this.x+this.w && cursor.y > this.y && cursor.y < this.y+this.h && click){
            if(this.e != "dismissSettings"){
                window[this.e]();
            }
        }else if(click && this.e == "searchbar"){
            clearInterval(cursorLoop); 
            flashingCursor = false;
            canType = false;
        }else if(click && this.e == "dismissSettings" && displaySettings == true){
            displaySettings = false;
            click = false;
            drawBar([,,,groups[3].h,groups[4].h,groups[5].h,groups[6].h,groups[7].h,groups[8].h,groups[9].h,1,1,1,1,1,1])
        }
        
        if(cursor.x > this.x && cursor.x < this.x+this.w && cursor.y > this.y && cursor.y < this.y+this.h){
            if(this.e != 'searchbar' && this.e != 'startGame' && this.e != "dismissSettings"){
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
                ctx.fillRect(this.x-3,this.y-3,this.w+6,this.h+6) 
            }else if(this.e == 'searchbar' && searchText != "Search with Google or enter address" && searchText != "highscores.com"){
                cursorCanvas.style.cursor = "text"
                cursorCanvas.class = this.e
            }
        }else if(cursorCanvas.class == this.e){
            cursorCanvas.style.cursor = "default"
            cursorCanvas.class = ""
        }
    }

    draw(){
        ctx.strokeStyle = "#fe3c02"
        ctx.lineWidth = 1
        ctx.strokeRect(this.x,this.y,this.w,this.h)
    }
}

//group for drawing
class group{
    constructor(data,isHidden){
        this.d = data
        this.h = isHidden
    }
    
    draw(){
        if(!this.h && !refresh){
            for(let i=0;i<this.d.length;i++){
                if(this.d[i].t == "p" && !this.d[i].h){
                    ctx.save()
                    ctx.translate(this.d[i].x,this.d[i].y)
                    ctx.rotate(this.d[i].r)
                    drawPath(0,0,this.d[i].d,this.d[i].c,this.d[i].f,this.d[i].s)
                    ctx.restore()
                }if(this.d[i].t == "t" && !this.d[i].h){
                    drawText(this.d[i].c,this.d[i].txt,this.d[i].fs,this.d[i].fw,this.d[i].id,this.d[i].x,this.d[i].y,this.d[i].cx,this.d[i].cy)
                }
            }
        }
    }
    
    clicked(){
        if(!this.h){
            for(let i=0;i<this.d.length;i++){
                if(this.d[i].click && !this.d[i].h){
                    if(this.d[i].click.x && this.d[i].click.x){
                        clickableObjectsData.push({x:this.d[i].click.x-3,y:this.d[i].click.y-3,w:this.d[i].click.w+6,h:this.d[i].click.h+6,e:this.d[i].click.e})  
                    }else{
                        clickableObjectsData.push({x:this.d[i].x-3,y:this.d[i].y-3,w:this.d[i].click.w+6,h:this.d[i].click.h+6,e:this.d[i].click.e})                    
                    }
                }
            }
        }
    }
}

let puzzleGame = {
    cursor:{x:0,y:0},
    win:1,
    draw(){
        for(i=1;i<puzzle.children.length;i++){
            let index = parseInt(puzzle.children[i].id.split("")[4])
            let y = Math.floor(index/3)*200
            let x = index%3*200
            
            if(puzzleGame.cursor.x > x && puzzleGame.cursor.x < x+200 && puzzleGame.cursor.y > y && puzzleGame.cursor.y < y+200 && click){
                let diff = index-parseInt(puzzle.children[0].id.split("")[4])
                click = false; 
                
                if(diff == 1 && x != 0){
                    puzzle.children[0].id = "spot"+index
                    puzzle.children[i].id = "spot"+(index-1)
                }
                else if(diff == -1 && x != 400){
                    puzzle.children[0].id = "spot"+index
                    puzzle.children[i].id = "spot"+(index+1)
                }
                else if(diff == 3){
                    puzzle.children[0].id = "spot"+index
                    puzzle.children[i].id = "spot"+(index-3)
                }
                else if(diff == -3){
                    puzzle.children[0].id = "spot"+index
                    puzzle.children[i].id = "spot"+(index+3)
                }
            }
        }
    },
    reset(r){
        let positions = [8,0,1,2,3,4,5,6,7]
        if(!r){
            positions = []
            for(i=0;i<puzzle.children.length;i++){
                positions.push(Math.floor(Math.random()*9))
            }
        }
            
        if(new Set(positions).size !== positions.length){
            puzzleGame.reset()
        }else{
            for(i=0;i<puzzle.children.length;i++){
                 puzzle.children[i].id = "spot"+positions[i]
            }
        }
    }, 
    hasWon(){
        for(i=1;i<puzzle.children.length;i++){
            if("spot"+(i-1) != puzzle.children[i].id){
                puzzleGame.win = 0;
                break;
            }
            
            if(i==8 && !puzzleGame.win){
                setTimeout(()=>{alert("The game's ID ends with... "+correctURL.split("#")[1].slice(3,6));},500)
                puzzleGame.win = 1;
            }
        }
    }
}

let drawingGame = {
    lines:[],
    clicked:0,
    canDraw:0,
    draw(){
        if(this.clicked && cursor.y > 90 && this.canDraw){       
            let line = {x:cursor.x,y:cursor.y}
            this.lines.push(line);
            
            setTimeout(()=>{if(!this.clicked){this.lines.push("end")}},10)
        }
        
        for(i=1;i<this.lines.length;i++){
            ctx.beginPath()
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 5;
            if(this.lines[i-1] != "end"){
            ctx.moveTo(this.lines[i].x,this.lines[i].y)
            ctx.lineTo(this.lines[i-1].x,this.lines[i-1].y)
            }
            ctx.stroke()
        }
    }
}


//main update loop
function update() {
    if(click || refresh){
        for(let i = 0; i < t.children.length; i++){
            t.children[i].style.visibility = "hidden"
        }
    }
    
    loop = requestAnimationFrame(update);
    canvas.width = cursorCanvas.width = width;
    canvas.height = cursorCanvas.height = height;
    
    if(refresh){
        firefox.style.display = "none"
        js13k.style.display = "none"
        google.style.display = "none"
        
        drawPath(0,0,"r 0 0 "+width+" "+height+" 1","#fff")
        
    }else{
        drawPath(0,0,"r 0 0 "+width+" "+height+" 1",backgroundColor)
        drawingGame.draw()
        draw()
        updateObject(groups, ["draw"])
        
        if(searchBarX+45+textD("searchText").width > searchBarX+searchBarW){
            searchText = searchText.slice(0,searchText.length-1)
        }
        
        updateObject(clickableObjects, ["draw","clicked"])
        
        puzzleGame.draw()
        puzzleGame.hasWon()
    }
    
    if(flashingCursor){
        
        drawText(cp[3], searchText.slice(0,flashingCursorX), 14, 500, "flashingCursorX", searchBarX+35, 65, 0, 1)
        drawPath(searchBarX+35+textD("flashingCursorX").width,55,"r 0 0 1 20 1", cp[3])
    }
}


//draws everything
function draw(){
    
    if(tabText == "New Tab"){
        js13k.style.display = "none"
        firefox.style.display = "block"
        google.style.display = "block"
        google.style.left = width/2-startButtonWidth/2+14
        google.style.top = 90+(startButtonY-10)
        groups[2].d[10].h = groups[4].h = 0
        groups[1].d[4].h = groups[2].d[8].h = groups[2].d[9].h = groups[3].h = 1
        
    }else if(tabText == correctURL){
        firefox.style.display = "none"
        js13k.style.display = "block"
        google.style.display = "none"
        groups[2].d[8].h = 0
        groups[2].d[10].h = groups[4].h = 1
        
    }else if(tabText == "404 Not Found"){
        firefox.style.display = "none"
        js13k.style.display = "none"
        google.style.display = "none"
        groups[1].d[4].h = groups[2].d[8].h = groups[2].d[9].h = groups[3].h = 0
        groups[2].d[10].h = groups[4].h = 1
    }else if(tabText == "Highscores" || tabText == "Credits" || tabText == "How To Play"){
        firefox.style.display = "block"
        js13k.style.display = "none"
        google.style.display = "none"
        groups[2].d[8].h = 0
        groups[2].d[10].h = groups[4].h = 1
    }
    
    if(fixBrokenText){
        groups[12].d[5].txt = "&#10003;"
    }else{
        groups[12].d[5].txt = ""
    }
    
    if(groups[11].h){
        document.getElementById("emailInput").style.display = document.getElementById("passwordInput").style.display = "none"
    }
    
    if(groups[13].h){
        document.getElementById("colorInput").style.display = "none"
    }
}


//functions triggered by bounding boxes
function searchbar(){
        if(tabText == "404 Not Found"){
            clearInterval(cursorLoop)
            click = false;
            cursorLoop = setInterval(() => {flashingCursor = !flashingCursor}, 500)
            canType = true
            flashingCursorX = searchText.length
        }
}

function closeGame(){
    window.location.href = "https://js13kgames.com";
    refreshGame(60000)
}

function refreshGame(time){
    refresh = true;
    
    let secs = time
    
    if(!time){  
         secs = 300;
    }
    
    setTimeout(() => {refresh = false;},secs)
}

function loadMenu(){
    tabText = "New Tab"
    searchText= "Search with Google or enter address"
    refreshGame(200)
    isSignedIn = false;
    fixBrokenText = false;
    accountName = "Sign in to Firefox"
    backgroundColor = "#ffffff"
    hint1 = "You didn't think it would be that easy did you?"
    document.getElementById("emailInput").value = document.getElementById("passwordInput").value = ""
    drawBar()
    clearInterval(scoreLoop)
    highscores.splice(10,1)
}

function startGame(){
    if(!displaySettings){
        searchText = originURL
        tabText = "404 Not Found"
        refreshGame(200)
        drawBar([,,,,1,1,1,1,1,1,1,1,1,1,1,1])
        correctURL = "game"+generateColor()
        correctColor = generateColor()
        drawingGame.canDraw = 0;
        
        highscores.push({name:"???",score:0})
        scoreLoop = setInterval(()=>{highscores[highscores.length-1].score++},1000)
    }
}

function showSettings(){
    click = false;
        
    drawBar([,,,groups[3].h,groups[4].h,groups[5].h,groups[6].h,groups[7].h,groups[8].h,groups[9].h,0,1,1,1,1,1])
    
    setTimeout(()=>{displaySettings = true;},50)
}

function library(){
   //drawBar([,,,groups[3].h,groups[4].h,1,1,1,1,0,1])
}

function loginPassword(){
    //drawBar([,,,groups[3].h,groups[4].h,1,1,1,1,0,1]) 
}

function preferences(){
    drawBar([,,,groups[3].h,groups[4].h,groups[5].h,groups[6].h,groups[7].h,groups[8].h,groups[9].h,1,1,0,1,1,1]) 
    
    if(!isSignedIn){
        drawBar([,,,groups[3].h,groups[4].h,groups[5].h,groups[6].h,groups[7].h,groups[8].h,groups[9].h,1,1,1,1,0,1])
    }
}

function customize(){
    if(!isSignedIn){
        drawBar([,,,groups[3].h,groups[4].h,groups[5].h,groups[6].h,groups[7].h,groups[8].h,groups[9].h,1,1,1,1,0,1])
    }else{
        drawBar([,,,groups[3].h,groups[4].h,1,1,1,1,1,1,1,1,0,1,1]) 
        document.getElementById("colorInput").style.display = "block"
        document.getElementById("colorInput").value = backgroundColor
        document.getElementById("colorInput").style.left = width-120
        document.getElementById("colorInput").style.top = 180
    }
}

function account(){
    if(tabText != "404 Not Found"){
        drawBar([,,,groups[3].h,groups[4].h,groups[5].h,groups[6].h,groups[7].h,groups[8].h,groups[9].h,1,1,1,1,0,1]) 
    }else if(!isSignedIn){
        document.getElementById("emailInput").style.display = document.getElementById("passwordInput").style.display = "block"
        document.getElementById("emailInput").style.left = width-200
        document.getElementById("passwordInput").style.left = width-170
        document.getElementById("passwordInput").style.top = 262
        document.getElementById("emailInput").style.top = 212
        drawBar([,,,groups[3].h,groups[4].h,1,1,1,1,1,1,0,1,1,1,1])
    }else{
       drawBar([,,,groups[3].h,groups[4].h,1,1,1,1,1,1,1,1,1,1,0]) 
    }
}

function signIn(){
    if(document.getElementById("emailInput").value && document.getElementById("passwordInput").value){
        accountName = document.getElementById("emailInput").value + "@gmail.com"
        isSignedIn = true;
        click = false;
        drawBar([,,,groups[3].h,groups[4].h,1,1,1,1,1,1,1,1,1,1,0])
    }else{
        groups[6].d[7].txt = "*Invalid username or password"
    }
}

function signOut(){
    isSignedIn = false;
    accountName = "Sign in to Firefox"
    document.getElementById("emailInput").style.display = document.getElementById("passwordInput").style.display = "block"
    document.getElementById("emailInput").style.left = width-200
    document.getElementById("passwordInput").style.left = width-170
    document.getElementById("emailInput").value = document.getElementById("passwordInput").value = ""
    click = false;
    backgroundColor = "#ffffff"
    fixBrokenText = false;
    hint1 = "You didn't think it would be that easy did you?"
    drawBar([,,,groups[3].h,groups[4].h,1,1,1,1,1,1,0,1,1,1,1])
}

function check(){
    fixBrokenText = !fixBrokenText
    if(fixBrokenText){
        hint1 = "Set the background color to "+correctColor
    }
    click = false;
    drawBar([,,,groups[3].h,groups[4].h,1,1,1,1,1,1,1,0,1,1,1])
}

function saveChanges(){
    backgroundColor = document.getElementById("colorInput").value
    if(backgroundColor == correctColor){
        hint2 = "The game's ID starts with... #"+correctURL.split("#")[1].slice(0,3)
    }else{
        hint2 = ""
    }
    drawBar([,,,groups[3].h,groups[4].h,1,1,1,1,1,1,1,1,0,1,1]) 
}

function inspect(){
    if(tabText == "404 Not Found"){
        puzzle.style.display = "block"
        puzzleGame.win = true;
        puzzleGame.reset(1)
        setTimeout(()=>{puzzleGame.reset()},1500)
        displaySettings = false;
        cursorCanvas.style.background = "#00000080"
        clickableObjects = []
    }else{
        drawBar([,,,groups[3].h,groups[4].h,groups[5].h,groups[6].h,groups[7].h,groups[8].h,groups[9].h,1,1,1,1,0,1])
    }
}

function closeInspect(){
    puzzle.style.display = "none"
    cursorCanvas.style.background = "#00000000"
    tabText = "404 Not Found"
    drawBar([,,,groups[3].h,1,1,1,1,1,1,1,1,1,1,1,1])
}

function highscore(){
    refreshGame(200)
    if(!displaySettings){
        tabText = "Highscores"
        searchText = "highscores.com"
        drawBar([,,,1,1,,1,1,1,1,1,1,1,1,1,1])
    }
}

function credits(){
    refreshGame(200)
    if(!displaySettings){
        tabText = "Credits"
        searchText = "credits.com"
        backgroundColor = "#000"
        drawBar([,,,1,1,1,,1,1,1,1,1,1,1,1,1])
    }
}

function htp(){
    refreshGame(200)
    if(!displaySettings){
        tabText = "How To Play"
        searchText = "howtoplay.com"
        backgroundColor = "hsla(317, 2%, 14%, 1)"
        drawBar([,,,1,1,1,1,1,,1,1,1,1,1,1,1])
    }
}

function hasWon(){
    highscores[10].name = prompt("Please enter your initials:")
    if(highscores[10].name == null){
        highscores[10].name = "???"
    }
    
    winningText = "You did it, <br> You found the secret game! <br> It took you "+highscores[10].score+" seconds?"
    
    for(i=0;i<10;i++){
        if(highscores[i].score == "???" || highscores[i].score > highscores[10].score){
            if(highscores[i].score == "???"){
                highscores.splice(i,1,highscores[10]) 
            }else{
                highscores.splice(i,0,highscores[10])
            }
            highscores.splice(10,1)
            break;
        }
    }
                
    localStorage.setItem("JS13kSecretGames_Highscores",JSON.stringify(highscores))
    
    drawingGame.canDraw = 1;
    
    drawBar([,,,1,1,1,1,,1,1,1,1,1,1,1,1])
}

function resetDrawing(){
    drawingGame.lines = []
}

function resetHS(){
    refreshGame(200)
    highscores = []
    
    for(i=0;i<10;i++){
        highscores.push({name:"???",score:"???"})
    }
    
    localStorage.setItem("JS13kSecretGames_Highscores","")
    
    drawBar([,,,1,1,,1,1,1,1,1,1,1,1,1,1])
}

//misalanious functions
function createClickableObjects(){
    clickableObjects = []
    for(i=0;i<clickableObjectsData.length;i++){
        clickableObjects.push(new clickableObject(clickableObjectsData[i].x,clickableObjectsData[i].y,clickableObjectsData[i].w,clickableObjectsData[i].h,clickableObjectsData[i].e))
    }
}

function textD(id){
    return {width:document.getElementById(id).clientWidth,height:document.getElementById(id).clientHeight}
}

function updateObject(array,functions){
    for(let i = 0; i < functions.length; i++){
        for(let e = 0; e < array.length; e++){
            if(functions[i]){
                array[e][functions[i]]()
            }
        }
    }
}

function hex(str){
	let arr1 = [];
    
    if(fixBrokenText){
        return str
    }else{
        for (let n = 0, l = str.length; n < l; n ++){
            let hex = Number(str.charCodeAt(n)).toString(16);
            arr1.push(hex);
        }
        return arr1.join('');
    }
    
    if(!preferencesSaved){
        fixBrokenText = !fixBrokenText;
    }
}

function generateColor(){
    let l = "123456789abcdef";
    let c = "#"
    for(var i = 0; i < 6; i++) {
        c += l.charAt(Math.floor(Math.random()*15))
    }
    return c;
}

//draw functions

function interpetData(d,i){
        str = ""
                   
        for(e=i+2;e<d.length; e++){
            if(d.charAt(e) == ","){
                break;
            }else{
                str += d.charAt(e)
            }
        }
                
        str = str.split(" ")
        
        return str
    }
    
function drawPath(x,y,data,color,fill,s){
    for(i = 0; i < data.length; i++){
        if(data.charAt(i) == "s"){
            ctx.lineWidth = parseInt(interpetData(data, i)[0])
        }
    }
    
    ctx.fillStyle = ctx.strokeStyle = color;
    ctx.save()
    ctx.translate(x,y)
    ctx.scale(s,s)
    ctx.beginPath()
    
    for(i=0; i < data.length; i++){
        if(data.charAt(i) == "l"){
            if(interpetData(data, i)[2]){
                ctx.moveTo(interpetData(data, i)[0], interpetData(data, i)[1])
                ctx.lineTo(interpetData(data, i)[2], interpetData(data, i)[3])
            }else{
                ctx.lineTo(interpetData(data, i)[0], interpetData(data, i)[1])
            }
        }else if(data.charAt(i) == "s"){
            if(fill){
                ctx.fill()
            }else{
                ctx.stroke()
            }
            ctx.beginPath()
            ctx.lineWidth = parseInt(interpetData(data, i)[0])
        }else if(data.charAt(i) == "f"){
            if(fill){
                ctx.fill()
            }else{
                ctx.stroke()
            }
            
            ctx.fillStyle = ctx.strokeStyle = interpetData(data, i)[0]
            
            ctx.beginPath()
            
            i+=8
            fill = interpetData(data, i)[1]
        }else if(data.charAt(i) == "c"){
            if(fill){
                ctx.fill()
            }else{
                ctx.stroke()
            }
            ctx.beginPath()
            ctx.arc(interpetData(data, i)[0],interpetData(data, i)[1],interpetData(data, i)[2],interpetData(data, i)[3]*Math.PI,interpetData(data, i)[4]*Math.PI)
            if(interpetData(data, i)[5]){
                ctx.fill()
            }else{
                ctx.stroke()
            }
            ctx.beginPath()
        }else if(data.charAt(i) == "r"){
            if(interpetData(data, i)[4]){
                ctx.fillRect(interpetData(data, i)[0],interpetData(data, i)[1],interpetData(data, i)[2],interpetData(data, i)[3])
            }else{
                ctx.strokeRect(interpetData(data, i)[0],interpetData(data, i)[1],interpetData(data, i)[2],interpetData(data, i)[3])
            }
        }
    }
    
    if(fill){
        ctx.fill()
    }else{
        ctx.stroke()
    }
    ctx.restore()
}

function drawText(color,txt,px,weight,id,x,y,centerX,centerY){
    let text = txt.split(" ").join("&nbsp;");
    let newText = document.getElementById(id)
    
    if(newText && newText.innerHTML == text){
        newText.style.visibility = "visible"
    }else{
        let p = document.createElement("p")
        p.id = id
        p.style.color = color
        p.style.left = x
        p.style.top = y
        p.style.fontWeight = weight
        p.style.fontSize = px
        p.innerHTML = text
        
        if(newText){
            newText.innerHTML = text
            newText.style.visibility = "visible"
        }else{
            t.appendChild(p) 
        }
        newText = document.getElementById(id)
        if(centerX){
            newText.style.left = x - textD(id).width/2
        }
        if(centerY){
            newText.style.top = y - textD(id).height/2
        }
    }
}

//event listners
cursorCanvas.onmousemove = function(e){cursor.x = e.clientX-cursorCanvas.getBoundingClientRect().left;cursor.y = e.clientY-cursorCanvas.getBoundingClientRect().top;}

cursorCanvas.onmousedown = function(e){drawingGame.clicked = 1;click = true;setTimeout(()=>{click = false},15);}
cursorCanvas.onmouseup = function(e){drawingGame.clicked = 0;}

puzzle.onmousemove = function(e){puzzleGame.cursor.x = e.clientX-puzzle.getBoundingClientRect().left;puzzleGame.cursor.y = e.clientY-puzzle.getBoundingClientRect().top;}
puzzle.onmousedown = function(e){click = true;setTimeout(()=>{click = false},15);}

window.onresize = function(e){
    width = 850
    height = 850
    
    if(window.innerWidth > width){
        width = window.innerWidth;
    }
    
    if(window.innerHeight > height){
        height = window.innerHeight;
    }
    
    startButtonY = (height - 90) / 3;
    
    searchBarW = width*0.7
    
    if(searchBarX+width*0.7 > width - iconWH*7){
        searchBarW = width - iconWH*7 - searchBarX
    }
          
    startButtonWidth = width*0.7
    
    if(width*0.7 > 800){
        startButtonWidth = 800
    }
    
    drawBar([,,,groups[3].h,groups[4].h,groups[5].h,groups[6].h,groups[7].h,groups[8].h,groups[9].h,1,1,1,1,1,1,1,1])
}

document.addEventListener("keydown", function (e) {
    if(canType){
        if(e.key.length == 1 && searchBarX+50+textD("searchText").width < searchBarX+searchBarW){
            let tempSearchText ='';
            tempSearchText = searchText.slice(0, flashingCursorX);
            tempSearchText += e.key
            tempSearchText += searchText.slice(flashingCursorX, searchText.length)
            searchText = tempSearchText
            flashingCursorX += 1;
        }
        
        if(e.keyCode == 8 && flashingCursorX > originURL.length){
            e.preventDefault()
            let tempSearchText=''
            tempSearchText = searchText.slice(0, flashingCursorX-1);
            tempSearchText += searchText.slice(flashingCursorX, searchText.length)
            searchText = tempSearchText
            flashingCursorX -= 1;
        }
        
        if(e.keyCode == 37 && flashingCursorX > originURL.length){
            flashingCursorX -= 1;
        }
        
        if(e.keyCode == 39 && flashingCursorX < searchText.length){
            flashingCursorX += 1;
        }
        
        if(e.keyCode == 13){
            if(searchText == originURL+correctURL){
                tabText = searchText.slice(originURL.length,22+originURL.length)
                
                 groups[3].h  = groups[5].h = 1
                
                clearInterval(scoreLoop)
                clearInterval(cursorLoop); 
                flashingCursor = false;
                canType = false;
                searchText = searchText.split(" ").join("%20")
                refreshGame(200)
                groups[4].h  = groups[5].h = 1
                setTimeout(hasWon,700)
            }else{
                tabText = "404 Not Found"
            }
        }
        drawBar([,,,groups[3].h,groups[4].h,groups[5].h,groups[6].h,groups[7].h,groups[8].h,groups[8].h,1,1,1,1,1,1])
    }else{
        if(e.keyCode == 80){
            if(myAudioNode){
                stopSong()
            }else{
                playSong()
            }
        }
        
        if(e.keyCode == 32){
            e.preventDefault()
            //dino.jump
        }
    }
})
//functions to call onload

let groups = []

function drawBar(hidden){
    
    let isHidden = [,,,1,,1,1,1,1,1,1,1,1,1,1,1,1,1]
    
    if(hidden){
        isHidden = []
        for(let i = 0; i < hidden.length; i++){
            isHidden.push(hidden[i])
        }
    }
    
    groups = [];
    clickableObjectsData = [];
    t.innerHTML = ""
    
    let f = ["c 0 0 6.5 0 2 1","s 1, l 0 -6 6 0, l 0 6",width/2-startButtonWidth/2,height/3,"s 2, r 0 0 279 480, l 232.5 0 242.5 -10, l 252.5 0, f #ffffff, l 232.5 0 242.5 -10, l 252.5 0, l 232.5 0, r 0 0 279 480 1","s 2, c 0 0 14 0 2, c 0 -5 6 0 2, c 0 11 10 1.1 1.9",{d:"s 2, l 0 0 40 0, l 7.5 22.5, l 20 -17.5, l 32.5 22.5, l 0 0",c:'#FFFFFF',f:1,s:0.5,t:"p"},((height-90)/2)+90]
    
    let data = [
        [{t:"p",x:0,y:0,d:"r 0 0 "+width+" 90 1, f #28CA42, c 62 20 6.5 0 2 1",c:cp[0]},{t:"p",x:20,y:20,d:f[0],c:"#ff6059",click:{x:17,y:17,w:6,h:6,e:"closeGame"}},{t:"p",x:41,y:20,d:f[0],c:"#ffbd2e",click:{x:38,y:17,w:6,h:6,e:"closeGame"}}],//background
        
        [{t:"p",x:tabX,y:0,d:"r 0 0 "+tabWidth+" 40 1, f "+cp[2]+", r 0 0 "+tabWidth+" 2 1",c:cp[1]},{t:"p",x:tabX+tabWidth-24,y:16,d:"s 1, l 0 0 8 8, l 0 8 8 0",c:cp[3],click:{w:8,h:8,e:"closeGame"}},{t:"p",x:tabX+tabWidth+iconWH,y:20-iconWH/2,d:"s 3, l 0 10 20 10, l 10 0 10 20",c:cp[1],f:0,s:iconWH/20},{t:"t",c:cp[3],txt:tabText,fs:12,fw:500,id:"tabText",x:tabX+40,y:22,cy:1},{t:"p",x:tabX+9,y:10,d:"s 2, l 0 22 22 22, l 11 0, l 0 22, f #000000 1, l 11 6 11 16, l 11 18 11 20",c:"#f8d812",f:1,h:1}],//tab (do something with + button)
        
        [{t:"p",x:0,y:40,d:"r 0 0 "+width+" 50 1, f "+cp[5]+", r 0 50 "+width+" 1 1, r "+(width-iconWH*5)+" 5 1 40 1",c:cp[4]},{t:"p",x:searchBarX,y:50,d:"s 1, r 0 0 "+searchBarW+" 30",c:cp[5],click:{w:searchBarW,h:30,e:"searchbar"}},{t:"t",c:cp[3],txt:searchText,fs:14,fw:500,id:"searchText",x:searchBarX+35,y:65,cy:1},{t:"p",x:width-iconWH*3,y:65-iconWH/2,d:"s 2, l 0 3 20 3, l 0 10 20 10, l 0 17 20 17",c:cp[3],f:0,s:iconWH/20,click:{w:iconWH,h:iconWH,e:"showSettings"}},{t:"p",x:iconWH*7+extra*3,y:65-iconWH/2,d:"s 2, l 0 10 0 20, l 20 20, l 20 10, l 25 12 10 0, l -5 12, r 7.5 10 5 10 1",c:cp[3],f:0,s:iconWH/20,click:{w:iconWH,h:iconWH,e:"loadMenu"}},{t:"p",x:iconWH*3+extra,y:65-iconWH/2,d:"s 2, l 0 10 20 10, l 10 0, l 20 10 10 20",c:cp[5],f:0,s:iconWH/20},{t:"p",x:iconWH,y:65-iconWH/2,d:"s 2, l 20 10 0 10, l 10 0, l 0 10 10 20",c:cp[5],f:0,s:iconWH/20},{t:"p",x:iconWH*5+extra*2,y:65-iconWH/2,d:"s 2, c 10 10 10 .2 1.9, l 21 8 11 8, l 21 8 21 -2",c:cp[3],f:0,s:iconWH/20,click:{w:iconWH,h:iconWH,e:"refreshGame"}},{t:"p",x:searchBarX+10,y:58,d:"s 2, c 7 4 4 0 2, r 0 5 14 10 1",c:cp[5],f:0,h:1},{t:"p",x:searchBarX+10,y:58,d:"s 2, l 0 15 15 0",c:"#ff2d2d",f:0,s:1,h:1},{t:"p",x:searchBarX+10,y:58,d:"s 2, c 5 5 5 0 2, l 9 9 15 15",c:cp[5]}],//bar (needs back / forward button support)
        
        [{t:"p",x:width/2,y:45+height/2-200/2,d:"s 20, c 0 0 125 0 2, c -50 -50 25 0 2 1, c 50 -50 25 0 2 1, c 0 80 75 1.1 1.9",c:cp[5]},{t:"t",c:cp[5],txt:"404",fs:100,fw:600,id:"404",x:width/2,y:(height-90)/2-200/2+250,cx:1},{t:"t",c:'#DCDCDC',txt:"Page not Found",fs:25,fw:500,id:"404t1",x:width/2,y:(height-90)/2-200/2+370,cx:1},{t:"t",c:'#D3D3D3',txt:hex(hint1),fs:12,fw:500,id:"404t2",x:width/2,y:(height-90)/2-200/2+415,cx:1},{t:"t",c:'rgba(255, 255, 255, 0.47)',txt:hex(hint2),fs:20,fw:500,id:"404t3",x:width/2,y:(height-90)/2-200/2+515,cx:1}],//404 page
        
        
        [{t:"p",x:f[2],y:60+f[3]-25,d:"s 1, r 0 0 "+startButtonWidth+" 50",c:cp[3],click:{w:startButtonWidth,h:50,e:"startGame"}},{t:"p",x:width/2+startButtonWidth/2-40,y:50+f[3],d:"s 2, l 0 10 20 10, l 10 0, l 20 10 10 20",c:cp[3]},{t:"t",c:cp[3],txt:originURL,fs:18,fw:100,id:"sbt",x:f[2]+50,y:60+f[3],cy:1},{t:"p",x:f[2]-50,y:135+f[3],d:"r 0 0 9 9 1, r 0 11 9 9 1, r 11 0 9 9 1, r 11 11 9 9 1",c:cp[3]},{t:"t",c:cp[3],txt:"Top Sites",fs:15,fw:600,id:"ts",x:f[2]-20,y:145+f[3],cy:1},{t:"p",x:-10,y:142.5+f[3],d:"s 2, l 0 0 5 5, l 10 0",c:cp[3]},{t:"p",x:f[2]-40,y:175+f[3],d:"r 0 0 130 130 1, f #ff0000, r 150 0 130 130 1, f #ffffff, l 190 35 245 65, l 190 95, l 190 35, f #F0E68C, r 300 0 130 130 1, f "+cp[3]+" 1, s 5, c 365 81 13 0 2, l 362 70 350 50, l 340 50, l 355 75, l 367 70 380 50, l 390 50, l 375 75, f #FFDF00, c 365 81 11 0 2 1",c:"#000"},{t:"t",c:"yellow",txt:"C",fs:60,fw:100,id:"t1c",x:f[2]+25,y:240+f[3],cx:1,cy:1},{t:"t",c:cp[3],txt:"Credits",fs:13,fw:100,id:"t1n",x:f[2]+25,y:315+f[3],cx:1,click:{x:f[2]-40,y:175+f[3],w:130,h:155,e:"credits"}},{t:"t",c:cp[3],txt:"How to Play",fs:13,fw:100,id:"t2n",x:f[2]+175,y:315+f[3],cx:1,click:{x:f[2]+110,y:175+f[3],w:130,h:155,e:"htp"}},{t:"t",c:"goldenrod",txt:"&#9733",fs:15,fw:800,id:"1",x:f[2]+325,y:257+f[3],cx:1,cy:1},{t:"t",c:cp[3],txt:"Highscores",fs:13,fw:100,id:"t3n",x:f[2]+325,y:315+f[3],cx:1,click:{x:f[2]+260,y:175+f[3],w:130,h:155,e:"highscore"}}],
        
        [{t:"t",c:cp[3],txt:"Highscores",fs:50,fw:600,id:"ht",x:width/2,y:150,cx:1,cy:1},{t:"t",c:cp[3],txt:"1. "+highscores[0].name+" | "+highscores[0].score+"s",fs:28,fw:600,id:"h1",x:width/2,y:250,cx:1,cy:1},{t:"t",c:cp[5],txt:"2. "+highscores[1].name+" | "+highscores[1].score+"s",fs:25,fw:500,id:"h2",x:width/2,y:300,cx:1,cy:1},{t:"t",c:cp[3],txt:"3. "+highscores[2].name+" | "+highscores[2].score+"s",fs:25,fw:500,id:"h3",x:width/2,y:350,cx:1,cy:1},{t:"t",c:cp[5],txt:"4. "+highscores[3].name+" | "+highscores[3].score+"s",fs:25,fw:500,id:"h4",x:width/2,y:400,cx:1,cy:1},{t:"t",c:cp[3],txt:"5. "+highscores[4].name+" | "+highscores[4].score+"s",fs:25,fw:500,id:"h5",x:width/2,y:450,cx:1,cy:1},{t:"t",c:cp[5],txt:"6. "+highscores[5].name+" | "+highscores[5].score+"s",fs:25,fw:500,id:"h6",x:width/2,y:500,cx:1,cy:1},{t:"t",c:cp[3],txt:"7. "+highscores[6].name+" | "+highscores[6].score+"s",fs:25,fw:500,id:"h7",x:width/2,y:550,cx:1,cy:1},{t:"t",c:cp[5],txt:"8. "+highscores[7].name+" | "+highscores[7].score+"s",fs:25,fw:500,id:"h8",x:width/2,y:600,cx:1,cy:1},{t:"t",c:cp[3],txt:"9. "+highscores[8].name+" | "+highscores[8].score+"s",fs:25,fw:500,id:"h9",x:width/2,y:650,cx:1,cy:1},{t:"t",c:cp[5],txt:"10. "+highscores[9].name+" | "+highscores[9].score+"s",fs:25,fw:500,id:"h10",x:width/2,y:700,cx:1,cy:1},{t:"p",x:width/2-100,y:750,d:"r 0 0 200 50 1",c:cp[2],click:{w:200,h:50,e:"resetHS"}},{t:"t",c:"#fff",txt:"Reset Highscores",fs:20,fw:500,id:"rh",x:width/2,y:775,cx:1,cy:1}],
        
        [Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),Object.assign({x:Math.random()*width,y:Math.random()*height+90},f[6]),{t:"t",x:width/2,y:f[7]-285,txt:"Credits",fs:"50",fw:"600",id:"ch",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]-215,txt:"Programming",fs:"30",fw:"400",id:"cha",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]-175,txt:"Addison Craik",fs:"20",fw:"300",id:"ct",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]-135,txt:"Nathan Yang",fs:"20",fw:"300",id:"cta",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]-75,txt:"Music",fs:"30",fw:"400",id:"chb",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]-35,txt:"Aidan Webb",fs:"20",fw:"300",id:"ctb",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]+25,txt:"Art",fs:"30",fw:"400",id:"chc",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]+65,txt:"Addison Craik",fs:"20",fw:"300",id:"ctc",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]+105,txt:"Nathan Yang",fs:"20",fw:"300",id:"ctd",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]+165,txt:"Moral Support",fs:"30",fw:"400",id:"chd",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]+205,txt:"Aid-Ane Wobob",fs:"20",fw:"300",id:"cte",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]+245,txt:"Ed's ward Chop",fs:"20",fw:"300",id:"ctf",cx:1,cy:1,c:"yellow"},{t:"t",x:width/2,y:f[7]+285,txt:"B-Horn Flaming-Man",fs:"20",fw:"300",id:"ctg",cx:1,cy:1,c:"yellow"}],
        
        [{t:"t",x:width/2,y:height/2,txt:winningText,fs:"40",fw:"300",id:"wt",cx:1,cy:1,c:"black"},{t:"p",x:width/2-100,y:height - 125,d:"r 0 0 200 50 1",c:cp[2],click:{w:200,h:50,e:"resetDrawing"}},{t:"t",c:"#fff",txt:"Reset",fs:20,fw:500,id:"rD",x:width/2,y:height-100,cx:1,cy:1}],
        
        [{t:"t",x:width/2,y:150,txt:"How To Play",fs:"50",fw:"600",cx:1,cy:1,id:"htp",c:"FFFFFF"},{t:"t",x:width/2,y:200,txt:"*Insert Game Title Here* is  a puzzle solving game, where your objective is to complete puzzles in order to try and find the correct url to<br> js13kgame's secret game. Click on the search real box to begin the game and look around to try and find hints to complete the game.",id:"htp1",fs:"20",fw:"300",c:"#FFFFFF",cx:1},{t:"t",x:width/2,y:height*0.9,txt:"Have Fun!",id:"htp2",fs:"30",fw:"400",c:"#FFFFFF",cx:1,cy:1},{t:"t",x:width/2,y:270,txt:"If at any point you get stuck during the game and need a hint, go to settings (located in the top right corner and go to help)",fs:"20",fw:"300",id:"htp3",c:"FFFFFF",cx:1},{t:"t",x:width/2,y:350,txt:"Fox Game",fs:"30",fw:"400",id:"htp4",c:"FFFFFF",cx:1,cy:1},{t:"t",x:width/2,y:390,txt:"Press space to start the game, the objective is to get a score of 404",fs:"20",fw:"300",id:"htp6",c:"FFFFFF",cx:1},{t:"t",x:width/2,y:470,txt:"Tile Puzzle Game",fs:"30",fw:"400",id:"htp5",c:"FFFFFF",cx:1,cy:1},{t:"t",x:width/2,y:510,txt:"Click on the tiles in order to try and rearrange them into the correct image. <br>Note: there are some impossible configurations, in which case refresh the game.",fs:"20",fw:"300",id:"htp7",c:"FFFFFF",cx:1}],
        
        [],
        
        [{t:"p",x:width-280,y:90,d:f[4]+", s 1, f "+cp[5]+" 1, l 0 40 300 40, l 0 110 300 110, l 0 150 300 150, l 0 280 300 280, l 0 380 300 380",c:cp[5],click:{w:280,h:480,e:"dismissSettings"}},{t:"t",c:cp[3],txt:accountName,fs:13,fw:100,id:"account",x:width-240,y:110,cy:1},{t:"p",x:width-258,y:110,d:f[5],c:cp[3],s:0.5,click:{x:width-274,y:100,w:280,h:20,e:"account"}},{t:"t",c:cp[5],txt:"New Window",fs:13,fw:100,id:"newWindow",x:width-240,y:150,cy:1},{t:"t",c:cp[5],txt:"&#8984;N",fs:13,fw:100,id:"newWindowKey",x:width-33,y:150,cy:1},{t:"p",x:width-265,y:150,d:"s 2, r 0 -6 14 12, f #ffffff, r 7 0 12 12 1, f "+cp[5]+" 1, s 1, l 0 -3 14 -3, l 7 3 14 3, l 10.5 0 10.5 6",c:cp[5]},{t:"t",c:cp[5],txt:"New Private Window",fs:13,fw:100,id:"newPrivateWindow",x:width-240,y:180,cy:1},{t:"t",c:cp[5],txt:"&#8679&#8984;N",fs:13,fw:100,id:"newPrivateWindowKey",x:width-47,y:180,cy:1},{t:"p",x:width-265,y:180,d:"s 1, c 2.5 0 2.5 0 2, c 11.5 0 2.5 0 2, l 5 0 9 0",c:cp[5]},{t:"t",c:cp[5],txt:"Zoom",fs:13,fw:100,id:"zoom",x:width-240,y:220,cy:1},{t:"t",c:cp[5],txt:"100%",fs:13,fw:100,id:"zoom1",x:width-67.5,y:212.5},{t:"p",x:width-95,y:220,d:"s 2, l 0 0 15 0, l 70 0 85 0, l 77.5 -7.5 77.5 7.5, s 1, r 25 -10 40 20",c:cp[5]},/*zoom*/{t:"t",c:cp[5],txt:"Library",fs:13,fw:100,id:"library",x:width-240,y:260,cy:1},{t:"p",x:width-25,y:260,d:f[1],c:cp[5]},{t:"p",x:width-265,y:260,d:"s 1, l 0 -7 0 7, l 3 -5 3 7, l 6 -6 6 7, l 9 -6 14 7",c:cp[5],/*click:{x:width-274,y:250,w:280,h:20,e:"library"}*/},{t:"t",c:cp[5],txt:"Logins and Passwords",fs:13,fw:100,id:"loginPassword",x:width-240,y:290,cy:1},{t:"p",x:width-265,y:290,d:"s 1, c 11 0 3 0 2, l 0 0 8 0, l 2 1 2 4, l 5 1 5 4",c:cp[5],/*click:{x:width-274,y:280,w:280,h:20,e:"loginPassword"}*/},{t:"t",c:cp[3],txt:"Preferences",fs:13,fw:100,id:"preferences",x:width-240,y:320,cy:1},{t:"t",c:cp[3],txt:"&#8984;,",fs:13,fw:100,id:"preferencesKey",x:width-34,y:320,cy:1},{t:"p",x:width-265,y:320,d:"s 1, c 7 0 3.5 0 2, l 7 -3 7 -7, l 7 3 7 7, l 4 0 0 0, l 10 0 14 0, l 5 -2 2 -5, l 9 -2 12 -5, l 9 2 12 5, l 5 2 2 5",c:cp[3],click:{x:width-274,y:310,w:280,h:20,e:"preferences"}},{t:"t",c:cp[3],txt:"Customize",fs:13,fw:100,id:"customize",x:width-240,y:350,cy:1},{t:"p",x:width-265,y:350,d:"s 2, c 3 4 2 0 2 1, l 14 -7 5 2, s 1, l 1 4 0 7, l 3 6",c:cp[3],click:{x:width-274,y:340,w:280,h:20,e:"customize"}},{t:"t",c:cp[5],txt:"Open File",fs:13,fw:100,id:"openFile",x:width-240,y:390,cy:1},{t:"t",c:cp[5],txt:"&#8984;O",fs:13,fw:100,id:"openFileKey",x:width-34,y:390,cy:1},{t:"t",c:cp[5],txt:"Save Page As...",fs:13,fw:100,id:"savePage",x:width-240,y:420,cy:1},{t:"t",c:cp[5],txt:"&#8984;S",fs:13,fw:100,id:"savePageKey",x:width-34,y:420,cy:1},{t:"t",c:cp[5],txt:"Print",fs:13,fw:100,id:"print",x:width-240,y:450,cy:1},{t:"t",c:cp[5],txt:"&#8984;P",fs:13,fw:100,id:"printKey",x:width-34,y:450,cy:1},{t:"p",x:width-265,y:450,d:"s 1, r 0 -3 14 7 1, r 3 -7 8 4, f #ffffff, r 3 1 8 7 1, f "+cp[5]+" 1, r 3 1 8 7, l 5 5 9 5",c:cp[5]},{t:"t",c:cp[5],txt:"Find in This Page",fs:13,fw:100,id:"findInThisPage",x:width-240,y:490,cy:1},{t:"t",c:cp[5],txt:"&#8984;F",fs:13,fw:100,id:"findInThisPageKey",x:width-34,y:490,cy:1},{t:"t",c:cp[3],txt:"Web Developer",fs:13,fw:100,id:"webDeveloper",x:width-240,y:520,cy:1,click:{x:width-274,y:510,w:280,h:20,e:"inspect"}},{t:"p",x:width-27,y:520,d:f[1],c:cp[3]},{t:"t",c:cp[3],txt:"Help",fs:13,fw:100,id:"help",x:width-240,y:550,cy:1},{t:"p",x:width-27,y:550,d:f[1],c:cp[3]},{t:"p",x:width-265,y:550,d:"s 1, c 7 0 7 0 2",c:cp[3],click:{x:width-274,y:540,w:280,h:20,e:"help"}},{t:"t",c:cp[3],txt:"?",fs:12,fw:100,id:"questionMark",x:width-258,y:550,cx:1,cy:1}],//settings//settings
        
        [{t:"p",x:width-280,y:90,d:f[4]+", s 1, f "+cp[5]+" 1, l 0 50 400 50",c:cp[5],click:{w:280,h:480,e:"dismissSettings"}},{t:"p",x: width - 253, y:115,d:f[1], c: cp[3], s:1.2, r:Math.PI, click:{x:width-263,y:107.5,w:15,h:15,e:"showSettings"}},{t:"p",x:width-245,y:170,d:f[5],c:cp[3]}/*icon*/,{t:"t",c:cp[3],txt:"Account",fs:15,fw:700,id:"account",x:width-140,y:115,cx:1,cy:1},{t:"t",c:cp[3],txt:accountName,fs:15,fw:500,id:"signingIn",x:width - 220,y:170,cy:1},{t:"t",c:cp[3],txt:"Email:",fs:13,fw:600,id:"email",x:width-250,y:215},{t:"t",c:cp[3],txt:"Password:",fs:13,fw:600,id:"password",x:width-250,y:265},{t:"t",txt:"",fs:11,fw:100,id:"error",c:"red",x:width-250,y:300,cy:1},{t:"p",x:width-250,y:320,d:"s 2, r 0 0 220 30 1",c:cp[2],click:{x:width-245,y:325,w:210,h:20,e:"signIn"}},{t:"t",txt:"Sign In",fs:14,fw:300,c:cp[1],x:width-140,y:335,cx:1,cy:1}],//sign in
        
        //[{t:"p",x:width-280,y:90,d:f[4],c:cp[5],click:{w:280,h:480,e:"dismissSettings"}}],//library
        
        //[{t:"p",x:width-280,y:90,d:f[4],c:cp[5],click:{w:280,h:480,e:"dismissSettings"}}],//logins and passwords
        
        [{t:"p",x:width-280,y:90,d:f[4]+", s 1, f "+cp[3]+" 1, l 0 50 400 50",c:cp[5],click:{w:280,h:480,e:"dismissSettings"}},{t:"p",x: width - 253, y:115,d:f[1], c: cp[3], s:1.2, r:Math.PI, click:{x:width-263,y:107.5,w:15,h:15,e:"showSettings"}},{t:"t",c:cp[3],txt:"Preferences",fs:15,fw:700,id:"preferences",x:width-140,y:115,cx:1,cy:1},{t:"t",c:cp[3],txt:"Fix broken text:",fs:13,fw:600,id:"fbt",x:width-250,y:190, cy:1},{t:"p",x:width-130, y:180, d:"r 0 0 20 20 1", c:cp[2], click:{w:20,h:20,e:"check"}},{t:"t",c:"#ffffff",txt:"&#10003;",fs:13,fw:600,id:"check",x:width-120,y:190, cy:1, cx:1}],//preferences
        
        [{t:"p",x:width-280,y:90,d:f[4]+", s 1, f "+cp[3]+" 1, l 0 50 400 50",c:cp[5],click:{w:280,h:480,e:"dismissSettings"}},{t:"p",x: width - 253, y:115,d:f[1], c: cp[3], s:1.2, r:Math.PI, click:{x:width-263,y:107.5,w:15,h:15,e:"showSettings"}},{t:"t",c:cp[3],txt:"Customize",fs:15,fw:700,id:"customize",x:width-140,y:115,cx:1,cy:1},{t:"t",c:cp[3],txt:"Background color:",fs:13,fw:600,id:"fbt",x:width-250,y:190, cy:1},{t:"p",x:width-250,y:240,d:"s 2, r 0 0 220 30 1",c:cp[2],click:{x:width-245,y:245,w:210,h:20,e:"saveChanges"}},{t:"t",txt:"Save Changes",fs:"14",fw:"300",c:cp[1],x:width-140,y:255,cx:1,cy:1}],//customize
        
        [{t:"p",x:width-280,y:90,d:f[4]+", s 1, f "+cp[3]+" 1, l 0 50 400 50",c:cp[5],click:{w:280,h:480,e:"dismissSettings"}},{t:"p",x: width - 253, y:115,d:f[1], c: cp[3], s:1.2, r:Math.PI, click:{x:width-263,y:107.5,w:15,h:15,e:"showSettings"}},{t:"t",c:cp[3],txt:hex("error"),fs:15,fw:700,id:"customize",x:width-140,y:115,cx:1,cy:1},{t:"t",txt:"error: "+hex("please sign in"),fs:11,fw:100,id:"error",c:"red",x:width-140,y:300,cy:1,cx:1}],
        
        [{t:"p",x:width-280,y:90,d:f[4]+", s 1, f "+cp[5]+" 1, l 0 50 400 50",c:cp[5],click:{w:280,h:480,e:"dismissSettings"}},{t:"p",x: width - 253, y:115,d:f[1], c: cp[3], s:1.2, r:Math.PI, click:{x:width-263,y:107.5,w:15,h:15,e:"showSettings"}},{t:"p",x:width-245,y:170,d:f[5],c:cp[3]}/*icon*/,{t:"t",c:cp[3],txt:"Account",fs:15,fw:700,id:"account",x:width-140,y:115,cx:1,cy:1},{t:"t",c:cp[3],txt:accountName,fs:15,fw:500,id:"signingIn",x:width - 220,y:170,cy:1},{t:"p",x:width-250,y:320,d:"s 2, r 0 0 220 30 1",c:cp[2],click:{x:width-245,y:325,w:210,h:20,e:"signOut"}},{t:"t",txt:"Sign Out",fs:14,fw:300,c:cp[1],x:width-140,y:335,cx:1,cy:1}]
    ]
    
    for(let i=0; i<data.length; i++){
        groups.push(new group(data[i],isHidden[i]))
        groups[i].clicked()
    }
    
    createClickableObjects();
    
    updateObject(groups, ["draw"])
    
    setTimeout(()=>{if(!groups[4].h && !refresh){groups[4].d[5].x = f[2]+textD("ts").width};},300)
}
if(localStorage.getItem("JS13kSecretGames_Highscores")){
    highscores = JSON.parse(localStorage.getItem("JS13kSecretGames_Highscores"))
}else{
    resetHS()
}
drawBar()
onresize()
update();