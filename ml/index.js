window.addEventListener("load", () => {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    const socket = new WebSocket('ws://10.18.251.51:4567/');
    let currentData = [];

    const labels = [
	"FD_THUMBNEAR",
	"FD_THUMBFAR",
	"FD_THUMBINDEX",
	"FD_INDEXNEAR",
	"FD_INDEXFAR",
	"FD_INDEXMIDDLE",
	"FD_MIDDLENEAR",
	"FD_MIDDLEFAR",
	"FD_MIDDLERING",
	"FD_RINGNEAR",
	"FD_RINGFAR",
	"FD_RINGLITTLE",
	"FD_LITTLENEAR",
	"FD_LITTLEFAR",
	"FD_THUMBPALM",
	"FD_WRISTBEND",
	"FD_PITCH",
	"FD_ROL"];
    
    let redraw = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for(let i = 0; i < 22; i++) {
	    let x = 20 + 80 * i;
	    ctx.fillStyle = "#000000";
	    ctx.strokeRect(x, 20, 60, canvas.height-40);
	    let h = currentData[i] * (canvas.height-40);
	    ctx.fillRect(x, canvas.height - 20 - h, 60, h);
	}
    };

    redraw();

    /*let glyphs = ["A", "B", "C", "D", "E", "F",
		  "G", "H", "I", "J", "K", "L",
		  "M", "N", "O", "P", "Q", "R",
		  "S", "T", "U", "V", "W", "X",
		  "Y", "Z"];*/
    //let glyphs = ["Jprime", "rest", "P", "S", "U", "T", "D", "R", "L", "Z"];
    let glyphs = ["Zprime", "Jprime", "rest", "backspace"];

    let currentGlyph = null;
    let count = 1;
    let changeGlyph = (i) => {
	let glyph = glyphs[i];
	currentGlyph = glyph;
	document.getElementById("signgraphic").src = "/asl/" + glyph + ".png";
	document.getElementById("signlabel").innerText = glyph;
    };

    let taLabels = document.getElementById("labels");
    let taData = document.getElementById("data");
    let taTimes = document.getElementById("times");
    taLabels.value = "";
    taData.value = "";
    taTimes.value = "";
    
    window.addEventListener("keyup", (e) => {
	if(e.code == "Space") {
	    document.getElementById("count").innerText = "Count: " + (count++);
	    taLabels.value+= currentGlyph + "\n";
	    taData.value+= currentData.join(",") + "\n";
	    taTimes.value+= (Date.now() / 1000.0) + "\n";
	    changeGlyph(Math.floor(Math.random() * glyphs.length));
	}
    });
    
    changeGlyph(3);
    
    // Listen for messages
    socket.addEventListener("message", function(event) {
	console.log(event.data);
	//currentData = event.data.split(",").map((f) => parseFloat(f));
	currentData = JSON.parse(event.data);
	window.requestAnimationFrame(redraw);
    });
});
