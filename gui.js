const socket = new WebSocket('ws://10.18.251.51:4567/');

const confidenceThreshold = 0.75;
const millisForEntry = 1500;

class DataEntryModel {
    constructor(listener, view) {
	this.listener = listener;
	this.view = view;
	this.currentSign = null;
	this.currentProgress = 0;
	this.lastUpdate = performance.now();
    }

    update(sign, confidence) {
	if(sign != this.currentSign) {
	    confidence = 0;
	}
	let prog = (performance.now() - this.lastUpdate) / millisForEntry;
	if(confidence < confidenceThreshold) {
	    this.currentProgress-= prog;
	} else if(sign != null && sign != "REST") {
	    this.currentProgress+= prog;
	}
	if(this.currentProgress < 0) {
	    this.currentProgress = 0;
	    this.currentSign = sign;
	}
	if(this.currentProgress > 1) {
	    this.currentProgress = 0;
	    this.listener.dataEntered(sign);
	}
	this.lastConfidence = confidence;
	this.lastUpdate = performance.now();
	this.view.redraw(this);
    }
};

class DataEntryView {
    constructor(canvas, dei) {
	this.canvas = canvas;
	this.ctx = this.canvas.getContext("2d");
	this.dei = dei;
    }

    redraw(model) {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	let r = Math.min(this.canvas.width, this.canvas.height)/2-2;

	this.ctx.lineWidth = 3;

	// outer circle
	this.ctx.strokeStyle = "#cecece";
	this.ctx.beginPath();
	this.ctx.moveTo(this.canvas.width/2, this.canvas.height/2);
	this.ctx.arc(this.canvas.width/2,
		     this.canvas.height/2,
		     r,
		     0, Math.PI*2);
	//this.ctx.stroke();

	// progress
	this.ctx.beginPath();
	this.ctx.moveTo(this.canvas.width/2, this.canvas.height/2);
	this.ctx.fillStyle = "#dedede";
	this.ctx.arc(this.canvas.width/2,
		     this.canvas.height/2,
		     r,
		     0, Math.PI*2*model.currentProgress);
	this.ctx.fill();

	// infill
	this.ctx.beginPath();
	this.ctx.fillStyle = "#121212";
	this.ctx.strokeStyle = "none";
	this.ctx.arc(this.canvas.width/2,
		     this.canvas.height/2,
		     r-30,
		     0, Math.PI*2);
	this.ctx.fill();
	//this.ctx.stroke();

	this.ctx.fillStyle = "#dedede";
	this.ctx.font = "28px sans-serif";
	this.ctx.textAlign = "center";
	this.ctx.textBaseline = "middle";
	if(model.currentSign) {
	    let text = model.currentSign;// + "\n" + model.lastConfidence;
	    this.ctx.fillText(text, this.canvas.width/2, this.canvas.height/2, this.canvas.width);
	    this.ctx.fillText(model.lastConfidence, this.canvas.width/2, this.canvas.height/2+30, this.canvas.width);
	    this.dei.src = "/asl/" + model.currentSign + ".png";
	}
    }
};

class DataEntryController {
    constructor(model) {
	
    }

    feed(data) {
	
    }
};

class ChoicesListView {
    constructor(ol) {
	this.ol = ol;
	this.items = [];
	this.labels = ["A", "B", "C", "D", "E", "F", "G"];
    }

    clear() {
	while(this.ol.firstChild) {
	    this.ol.removeChild(this.ol.lastChild);
	}
	this.items = [];
    }

    addItem(desc, val) {
	let li = document.createElement("li");
	li.innerText = this.labels[this.items.length] + ": " + desc;
	this.ol.appendChild(li);
	this.items.push(val);
    }

    getItem(sign) {
	return this.items[this.labels.indexOf(sign)];
    }
};

class HomeState {
    constructor(views) {
	this.views = views;
	this.dem = new DataEntryModel(this, views.dataEntryView);
    }

    dataEntered(sign) {
	let f = this.views.choicesList.getItem(sign);
	if(f) {
	    f();
	}
    }

    exitState() {
	
    }

    enterState() {
	this.views.stateLabel.innerText = "Home";
	this.views.lettersBox.readOnly = true;
	this.views.lettersBox.disabled = true;
	this.views.lettersBox.value = "";
	this.views.choicesList.clear();
	this.views.choicesList.addItem("Phrase Search", () => {alert("phrase");});
	this.views.choicesList.addItem("Speller", () => {switchState(new SpellerState(this.views));});
	this.views.choicesList.addItem("Rehab", () => {alert("rehab")});
    }
};

class SpellerState {
    constructor(views) {
	this.views = views;
	this.dem = new DataEntryModel(this, views.dataEntryView);
    }

    dataEntered(sign) {
	switch(sign) {
	case null:
	    break;
	case "REST":
	    break;
	case "BACK":
	    this.views.lettersBox.value = this.views.lettersBox.value.slice(0, -1);
	    break;
	default:
	    this.views.lettersBox.value+= sign;
	    break;
	}
    }

    exitState() {
    }

    enterState() {
	this.views.stateLabel.innerText = "Speller";
	this.views.lettersBox.disabled = false;
	this.views.lettersBox.readOnly = false;
	this.views.lettersBox.value = "";
	this.views.choicesList.clear();
    }
};

let currentState;
let switchState = (s) => {
    if(currentState != null) {
	currentState.exitState();
    }
    currentState = s;
    currentState.enterState();
};

window.addEventListener("load", () => {
    const views = {
	stateLabel: document.getElementById("stateLabel"),
	dataEntryView: new DataEntryView(
	    document.getElementById("dataEntryCanvas"),
	    document.getElementById("dataEntryImage")),
	lettersBox: document.getElementById("lettersBox"),
	choicesList: new ChoicesListView(document.getElementById("choicesList"))
    };
    switchState(new HomeState(views));
});

tf.loadLayersModel("/epic_num_reader_js/model.json").then((model) => {
    socket.addEventListener("message", function(event) {
	if(currentState != null) {
	    let t = tf.tensor(JSON.parse(event.data).slice(0, 18), [1, 18]);
	    let p = model.predict(t).arraySync()[0];
	    let sign = p.reduce((iMax, x, i, arr) => x > p[iMax] ? i : iMax, 0);
	    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'REST', 'BACK'];
	    currentState.dem.update(labels[sign], p[sign]);
	}
    });
});

/*
let testKey = null;
window.addEventListener("keydown", (e) => {
    testKey = e.key;
});
window.addEventListener("keyup", (e) => {
    testKey = null;
});
let updateKey = () => {
    if(currentState != null) {
	currentState.dem.update(testKey, 0.90);
    }
    window.requestAnimationFrame(updateKey);
};
window.requestAnimationFrame(updateKey);
*/
