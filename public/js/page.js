let DOMbody = document.body;
let DOMCurrentQueueItem = document.querySelector(".current-item");
let DOMQueueList = document.querySelector(".queue-list");
let DOMQueueEmpty = document.querySelector(".queue-empty");
let DOMQueueItemTemplate = document.querySelector("#queue-item-template").querySelector(".queue-item");

let currentQueueItem = null;
let currentQueue = [];
let currentQueueSize = 0;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        DOMbody.style.opacity = 1;
    }, 0);

    getQueue();
    setInterval(() => {
        getQueue();
    }, 2500);
});

function getQueue() {
    fetch('./api/queue').then(data => {
        return data.json();
    }).then(data => {
        if(currentQueueSize != data.length) {
            currentQueue = data;
            currentQueueSize = data.length;
            updateQueue();
        }
    });
}

function updateQueue() {
    console.log("Updating Queue");

    // Clear DOM
    DOMQueueList.innerHTML = "";

    // Hide Empty UI if neccessary
    if(currentQueue.length == 0) {
        DOMQueueEmpty.classList.add("active");
    } else {
        DOMQueueEmpty.classList.remove("active");
    }

    // Reconstruct DOM
    currentQueue.forEach(queueItem => {
        let DOMQueueItem = DOMQueueItemTemplate.cloneNode(true);

        let DOMQICover = DOMQueueItem.querySelector(".cover");
        DOMQICover.style.backgroundImage = `url("${queueItem.chart.cover}")`;

        let DOMQITitle = DOMQueueItem.querySelector(".title");
        DOMQITitle.innerText = queueItem.chart.title;
        
        let DOMQIAuthor = DOMQueueItem.querySelector(".author");
        DOMQIAuthor.innerText = queueItem.chart.artist + " • Charted by " + queueItem.chart.charter;
        
        let DOMQIRequest = DOMQueueItem.querySelector(".requestedby span");
        DOMQIRequest.innerText = queueItem.user;

        // Construct difficulties
        let DOMQIDiffE = DOMQueueItem.querySelector(".difficulties .diffEasy");
        if(queueItem.chart.hasEasyDifficulty) {
            DOMQIDiffE.innerHTML = "<span>E</span>" + (queueItem.chart.easyDifficulty == null ? 0 : queueItem.chart.easyDifficulty);
            DOMQIDiffE.style.display = "block";
        } else {
            DOMQIDiffE.style.display = "none";
        }

        let DOMQIDiffN = DOMQueueItem.querySelector(".difficulties .diffNormal");
        if(queueItem.chart.hasNormalDifficulty) {
            DOMQIDiffN.innerHTML = "<span>N</span>" + (queueItem.chart.normalDifficulty == null ? 0 : queueItem.chart.normalDifficulty);
            DOMQIDiffN.style.display = "block";
        } else {
            DOMQIDiffN.style.display = "none";
        }

        let DOMQIDiffH = DOMQueueItem.querySelector(".difficulties .diffHard");
        if(queueItem.chart.hasHardDifficulty) {
            DOMQIDiffH.innerHTML = "<span>H</span>" + (queueItem.chart.hardDifficulty == null ? 0 : queueItem.chart.hardDifficulty);
            DOMQIDiffH.style.display = "block";
        } else {
            DOMQIDiffH.style.display = "none";
        }

        let DOMQIDiffEX = DOMQueueItem.querySelector(".difficulties .diffExpert");
        if(queueItem.chart.hasExtremeDifficulty) {
            DOMQIDiffEX.innerHTML = "<span>EX</span>" + (queueItem.chart.expertDifficulty == null ? 0 : queueItem.chart.expertDifficulty);
            DOMQIDiffEX.style.display = "block";
        } else {
            DOMQIDiffEX.style.display = "none";
        }

        let DOMQIDiffXD = DOMQueueItem.querySelector(".difficulties .diffXD");
        if(queueItem.chart.hasXDDifficulty) {
            DOMQIDiffXD.innerHTML = "<span>XD</span>" + (queueItem.chart.XDDifficulty == null ? 0 : queueItem.chart.XDDifficulty);
            DOMQIDiffXD.style.display = "block";
        } else {
            DOMQIDiffXD.style.display = "none";
        }

        // Add click buttons
        
        let DOMQIPlayButton = DOMQueueItem.querySelector(".buttonPlay");
        DOMQIPlayButton.addEventListener('click', () => {
            playFromQueue(currentQueue.indexOf(queueItem));
        });

        let DOMQIRemoveButton = DOMQueueItem.querySelector(".buttonRemove");
        DOMQIRemoveButton.addEventListener('click', () => {
            removeFromQueue(currentQueue.indexOf(queueItem));
        });

        DOMQueueList.appendChild(DOMQueueItem);
    });
}

function playFromQueue( queueIndex ) {
    console.log("Changing CurrentPlaying chart to queue index " + queueIndex);

    updateCurrentItem(queueIndex);
}

function removeFromQueue( queueIndex ) {
    console.log("Removing chart at queue index " + queueIndex);

    fetch('./api/remove/' + queueIndex).then(data => {
        return data.json();
    }).then(data => {
        currentQueue = data;
        currentQueueSize = data.length;
        updateQueue();
    });
}

function updateCurrentItem( queueIndex ) {
    if(queueIndex == null) {
        DOMCurrentQueueItem.style.display = "none";
        return;
    } else {
        DOMCurrentQueueItem.style.display = "block";
    }

    currentQueueItem = currentQueue[queueIndex];
    
    let DOMQICover = DOMCurrentQueueItem.querySelector(".cover");
    DOMQICover.style.backgroundImage = `url("${currentQueueItem.chart.cover}")`;

    let DOMQITitle = DOMCurrentQueueItem.querySelector(".title");
    DOMQITitle.innerText = currentQueueItem.chart.title;
    
    let DOMQIAuthor = DOMCurrentQueueItem.querySelector(".author");
    DOMQIAuthor.innerText = currentQueueItem.chart.artist + " • Charted by " + currentQueueItem.chart.charter;
    
    let DOMQIRequest = DOMCurrentQueueItem.querySelector(".requestedby span");
    DOMQIRequest.innerText = currentQueueItem.user;

    // Construct difficulties
    let DOMQIDiffE = DOMCurrentQueueItem.querySelector(".difficulties .diffEasy");
    if(currentQueueItem.chart.hasEasyDifficulty) {
        DOMQIDiffE.innerHTML = "<span>E</span>" + (currentQueueItem.chart.easyDifficulty == null ? 0 : currentQueueItem.chart.easyDifficulty);
        DOMQIDiffE.style.display = "block";
    } else {
        DOMQIDiffE.style.display = "none";
    }

    let DOMQIDiffN = DOMCurrentQueueItem.querySelector(".difficulties .diffNormal");
    if(currentQueueItem.chart.hasNormalDifficulty) {
        DOMQIDiffN.innerHTML = "<span>N</span>" + (currentQueueItem.chart.normalDifficulty == null ? 0 : currentQueueItem.chart.normalDifficulty);
        DOMQIDiffN.style.display = "block";
    } else {
        DOMQIDiffN.style.display = "none";
    }

    let DOMQIDiffH = DOMCurrentQueueItem.querySelector(".difficulties .diffHard");
    if(currentQueueItem.chart.hasHardDifficulty) {
        DOMQIDiffH.innerHTML = "<span>H</span>" + (currentQueueItem.chart.hardDifficulty == null ? 0 : currentQueueItem.chart.hardDifficulty);
        DOMQIDiffH.style.display = "block";
    } else {
        DOMQIDiffH.style.display = "none";
    }

    let DOMQIDiffEX = DOMCurrentQueueItem.querySelector(".difficulties .diffExpert");
    if(currentQueueItem.chart.hasExtremeDifficulty) {
        DOMQIDiffEX.innerHTML = "<span>EX</span>" + (currentQueueItem.chart.expertDifficulty == null ? 0 : currentQueueItem.chart.expertDifficulty);
        DOMQIDiffEX.style.display = "block";
    } else {
        DOMQIDiffEX.style.display = "none";
    }

    let DOMQIDiffXD = DOMCurrentQueueItem.querySelector(".difficulties .diffXD");
    if(currentQueueItem.chart.hasXDDifficulty) {
        DOMQIDiffXD.innerHTML = "<span>XD</span>" + (currentQueueItem.chart.XDDifficulty == null ? 0 : currentQueueItem.chart.XDDifficulty);
        DOMQIDiffXD.style.display = "block";
    } else {
        DOMQIDiffXD.style.display = "none";
    }
}

function removeCurrentQueueItem() {
    removeFromQueue(currentQueue.indexOf(currentQueueItem));
    updateCurrentItem( null );
}

function openCurrentQueueItemInClient() {
    window.open("spinshare-song://" + currentQueueItem.chart.id);
}

function openCurrentQueueItemOnSpinShare() {
    window.open("https://spinsha.re/song/" + currentQueueItem.chart.id, "_blank");
}