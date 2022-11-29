import React, { useEffect, useRef, useState } from 'react'
import CodeMirror from "@uiw/react-codemirror";
import AceEditor from "react-ace"
import "../assets/ace"


const Editor = ({childToParentInit}) => {
  var editor;
  const [data,setData] = useState("");

  useEffect(() => {
    // alert('In use effect')
    editor = ace.edit("editor");
    // console.log(ace)
    editor.setTheme("../assets/monokai.js");
    editor.setFontSize("16px");
    var customPosition = {
      row: 0,
      column: 0
    };
    var text = "Code here";
    editor.session.insert(customPosition , text);
    childToParentInit(editor);
  },[])
  return (
    <div>
      <div id="editor">
      </div>

    </div>
  );
}

export default Editor;
