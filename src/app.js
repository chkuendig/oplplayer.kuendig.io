import { Terminal } from "@xterm/xterm";
import { openpty } from "xterm-pty";
import Module from "../RetroWave/build/RetroWave_Player.js";

let module;
let xterm;
let terminal_elem;

function printMainscreen() {
  // Logo inspired from https://opl.wafflenet.com/
  xterm.write("\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r");
  var title = `
################################################################################\r
#                                                                              #\r
# The      ....||.   .....|||||||...       .|.  ▗▄▄▖ ▗▖    ▗▄▖▗▖  ▗▖▗▄▄▄▖▗▄▄▖  #\r
# ~~~   ..|||||||"  .|||||||||""""||.    ..||"  ▐▌ ▐▌▐▌   ▐▌ ▐▌▝▚▞▘ ▐▌   ▐▌ ▐▌ #\r
#     ..||||""" "|."""""  .|""    "||   .||"    ▐▛▀▘ ▐▌   ▐▛▀▜▌ ▐▌  ▐▛▀▀▘▐▛▀▚▖ #\r
#   ..||||""    .||     ..|"     ..|"  .||"     ▐▌   ▐▙▄▄▖▐▌ ▐▌ ▐▌  ▐▙▄▄▖▐▌ ▐▌ #\r
#  .|||"""     .||" ...||""   ...||" .|||"                                     #\r
#  |||"      .|||"  "|||||||||||""  .|||"                |~~~~~~~~~~~|         #\r
#  "||     .|||""  .||""""""""   ...|||......            |~~~~~~~~~~~|         #\r
#   "|....||""    .||"         ..||||||||||||||..        |           |         #\r
#    """"""        ""           """""    """""""     /~~\\|       /~~\\|         #\r
#                                                    \\__/        \\__/          #\r
################################################################################




\r    This webpage is playing music on OPL3 sound chips via the Web Serial API.
\r    It's a Javascript + Webassembly implementation of the RetroWavePlayer and 
\r    does not rely on emulation, so it only works with a physical device. It's 
\r    been tested on the RetroWave OPL3 Express (v2), but should generally work 
\r    with any OPL3 chip connected via serial port.  

`;
  xterm.write(title);
  xterm.write("");
  xterm.write("\n\r\r\n\r\n\r\n\r\n\r");
  xterm.write("\n\r                      \x1b[30m \x1b[43m 🎶  Drag and drop a wgm or vgz file 🎶  \x1b[0m")
  xterm.write("\n\r                    \x1b[30m \x1b[43m 🎶 onto this terminal to start playing! 🎶  \x1b[0m")

  xterm.write("\n\r                  (alternatively play a \x1b]8;;#play\x1b\\demo song\x1b]8;;\x1b\\ or a \x1b]8;;#test\x1b\\test sound\x1b]8;;\x1b\\)  \n\r");

  xterm.write("\n\r\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r");
  xterm.write("\n\r");

  xterm.write("                                                             Source code: \x1b]8;;https://github.com/chkuendig/oplplayer.kuendig.io\x1b\\Github\x1b]8;;\x1b\\\n\r")
  xterm.write("                                                      (c) \x1b]8;;https://christian.kuendig.info\x1b\\Christian_Kündig\x1b]8;;\x1b\\, 2025");
  xterm.write("\n\r");
}

function startPlayer(filename) {
  typeof filename === "object" ? (opts = filename) : (opts = [filename]);
  module.callMain(opts);
}

function resize() {
  // css scaling breaks despite being apparently fixed: xtermjs/xterm.js#3242 and xtermjs/xterm.js#2488
  // terminal_elem.style.transform = 'scale(' + terminal_elem.clientHeight / terminal_elem.firstChild.clientHeight + ')';
  // so we adjust the font size instead
  // default line height is approx 1.2x font size: https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
  xterm.options.fontSize = Math.floor(
    terminal_elem.clientHeight / (xterm.options.rows * 1.1)
  );
}

function activateLink(event, uri) {
  if (uri == "#play") {
    files = module["FS"]
      .readdir("/music/")
      .filter((file) => file.endsWith(".vgz") || file.endsWith(".vgm"));
    startPlayer("/music/" + files[Math.floor(Math.random() * files.length)]);
  } else if (uri == "#test") {
    startPlayer(["-T", "opl3_sine"]);
  } else {
    window.location.href = uri;
  }
  console.log(uri);
}

function initTerminal() {
terminal_elem = document.getElementById("terminal");
xterm = new Terminal({ scrollback: 0, rows: 50 });

xterm.options.fontFamily = '"Perfect DOS VGA 437 Win", Courier, monospace';
xterm.options.cursorBlink = true;
xterm.open(terminal_elem);
window.addEventListener("resize", resize);
resize();

/* Handle explicit links using USC 8 escape sequences. */
xterm.options.linkHandler = {
    activate: (event, text, range) => { activateLink(event, text); },
    hover: (event, text, range) => { /* nothing, by default */ },
    leave: (event, text, range) => { /* nothing, by default */ },
    allowNonHttpProtocols: true
  };;

// Create master/slave objects
const { master, slave } = openpty();
// Connect the master object to xterm.js
xterm.loadAddon(master);
xterm.attachCustomWheelEventHandler(ev => { return false; }); // ignore mouse wheel events
window.addEventListener("beforeunload", function (e) {
  module["_raise"](2); // SIGINT
});
var ModuleDefaults = {
  pty: slave,
  setStatus: (text) => {
    console.log(text);
    xterm.write(text + "\r\n");
    if (text === "") { printMainscreen(); }
  },
  totalDependencies: 0,
  monitorRunDependencies: (left) => {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    ModuleDefaults.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
  }
};


Module(ModuleDefaults).then((instance) => {
  module = instance;
  module.setStatus("Downloading...");
});


window.onerror = (event) => {
  // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
  module.setStatus(
    "Exception thrown, see JavaScript console or relaunch page to try again"
  );
  module.setStatus = (text) => {
    if (text) console.error("[post-exception status] " + text);
  };
};


function handleDroppedFiles(files) {
  files = files.filter(
    (file) => file.name.endsWith(".vgz") || file.name.endsWith(".vgm")
  );
  if (files.length >= 1) {
    file = files[0];
  }
  const file_reader = new FileReader();
  file_reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    var stream = module["FS"].open("/" + file.name, "w");
    module["FS"].write(stream, data, 0, data.length, 0);
    module["FS"].close(stream);
    startPlayer("/" + file.name);
  };
  file_reader.filename = file.name;
  file_reader.mime_type = file.type;
  file_reader.readAsArrayBuffer(file);

}

terminal_elem.ondrop = (ev) => {
  terminal_elem.style.opacity = 1;
  terminal_elem.style.border = "none";
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    handleDroppedFiles(
      [...ev.dataTransfer.items]
        .filter((item) => item.kind == "file")
        .map((item) => item.getAsFile())
    );
  } else {
    // Use DataTransfer interface to access the file(s)
    handleDroppedFiles([...ev.dataTransfer.files]);
  }
};
terminal_elem.ondragover = (ev) => {
  terminal_elem.style.opacity = 0.5;
  terminal_elem.style.border = "3px dashed white";
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
};

terminal_elem.ondragleave = (ev) => {
  terminal_elem.style.opacity = 1;
  terminal_elem.style.border = "none";
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
};

}
// TODO: workaround for font issues:
// https://github.com/xtermjs/xterm.js/issues/5164#issuecomment-2385438699

document.fonts.ready.then(
  fontFaceSet => Promise.all(Array.from(fontFaceSet).map(el => el.load())).then(initTerminal)
);