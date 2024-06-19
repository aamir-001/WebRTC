let localStream;
let remoteStream;
var tag;

const servers = [{
  urls: [
    "stun.l.google.com:19302",
    "stun1.l.google.com:19302",
    "stun2.l.google.com:19302"
  ]
}];

const lc = new RTCPeerConnection(servers);
const dc = lc.createDataChannel("channel");
const rc = new RTCPeerConnection(servers);

async function init() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    document.getElementById("user-1").srcObject = localStream;

    console.log("Local stream obtained successfully.");
  } catch (error) {
    console.error("Error accessing local media stream:", error);
  }
}


init().then(() => {
  console.log("--------------->>>>>>>>>>>>>>>>>>>>>>>>>>");
  var socket = io();
  socket.on("connect", () => {

    console.log("WebSocket connected");
    console.log(localStorage.getItem("tag"))

    socket.emit("addTag",localStorage.getItem("tag"))

    
    rc.addEventListener("track", e => {
      console.log("Track received:", e.track);
      if (e.streams && e.streams[0]) {
        document.getElementById("user-2").srcObject = e.streams[0];
      }
    });

    lc.addEventListener("track", e => {
      console.log("Track received from remote:", e.track);
      if (e.streams && e.streams[0]) {
        document.getElementById("user-2").srcObject = e.streams[0];
      }
    });

    localStream.getTracks().forEach(track => {
      lc.addTrack(track, localStream);
      console.log("Tracks added to lc.");
    });

    localStream.getTracks().forEach(track => {
      rc.addTrack(track, localStream);
      console.log("Tracks added to rc.");
    });
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  socket.on("becomeClient1", () => {
    console.log("Received becomeClient1 event");

    socket.on("notifyClient1", () => {
      console.log("Client 2 joined.");

      try {
        dc.onmessage = e => console.log("Received message: " + e.data);
        dc.onopen = e => {
          console.log("Data channel connection opened.");
          dc.send("heyyyyyy");
          socket.disconnect();
        };

        lc.createOffer().then(o => {
          lc.setLocalDescription(o);
          console.log("Local description set successfully." + JSON.stringify(o));
          socket.emit("client1offer", o);
        });

        lc.onicecandidate = event => {
          console.log("New ICE candidate. " + JSON.stringify(event));
          if (event.candidate) {
            socket.emit("client1IceCandidates", event.candidate);
          }
        };
      } catch (error) {
        console.error("Error setting up client 1:", error);
      }
    });

    socket.on("client2answer", answer => {
      lc.setRemoteDescription(answer).then(() => {
        console.log("remote description for cl1 set");
      });
    });
  });

  socket.on("becomeClient2", () => {
    console.log("Received becomeClient2 event");

    try {
      rc.onicecandidate = e => {
        console.log("New ICE candidate.");
      };

      rc.ondatachannel = e => {
        rc.dc = e.channel;
        rc.dc.onmessage = e => {
          console.log("Received message from client 1: " + e.data);
          rc.dc.send("supp");
        };
        rc.dc.onopen = e => {
          console.log("Data channel connection opened.");
        };
        socket.close();
      };

      socket.on("client1offer", offer => {
        console.log("-------------<<>>>>>>");
        rc.setRemoteDescription(offer).then(() => {
          console.log("cl1 offer set");
          rc.createAnswer().then(answer => {
            rc.setLocalDescription(answer);
            socket.emit("client2answer", answer);
          }).then(() => {
            console.log("Local description for cl2 set.");
          });
        });
      });

      socket.on("client1IceCandidates", client1IceCandidate => {
        console.log("cl1 ice ---> " + client1IceCandidate);
        rc.addIceCandidate(client1IceCandidate);
      });
    } catch (error) {
      console.error("Error setting up client 2:", error);
    }
  });
});

function setTag(){

  tag = document.getElementById("tag").value;
  localStorage.setItem("tag", tag);

}