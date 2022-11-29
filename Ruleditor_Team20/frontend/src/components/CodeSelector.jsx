import React, { useEffect, useState } from 'react'
import ListGroup from 'react-bootstrap/ListGroup';
import VanillaTilt from 'vanilla-tilt'
import jsonData from '../assets/response.json'

const CodeSelector = ({constructClickHandler,uploadData}) => {
  VanillaTilt.init(document.querySelector(".codeselector"), {
      max: 25,
      speed: 400,
  });

  const [data, setData] = useState([]);

  useEffect(()=>{
      console.log("uploadMagishu",uploadData)
      const getData = async () => {
        const loadData = JSON.parse(JSON.stringify(jsonData));
        setData(loadData.statements);
      };
  
      getData();
      console.log(data);
  },[])

  useEffect(()=>{
    console.log("SK",uploadData)
    setData(uploadData)
    // setData(uploadData)
  },[uploadData])



  const handleCodeSelect = (param) => {
    // const selected_title = data[param].title
    // const title_code = data[param].code
    // console.log(data[param])
    // alert(`Selected: ${selected_title}`)
    constructClickHandler(data[param].code)
  }

  return (
    <div className='codeselector'>
    <ListGroup>
      <ListGroup.Item>Choose Code</ListGroup.Item>
        <div className='codes'>
            {data.length>0 ? data.map((statement, num) => {
                return (
                  <ListGroup.Item key={num} action onClick={() => handleCodeSelect(num)} variant="dark">
                  {statement.title}
                  </ListGroup.Item>
                )
              }) :
              <ListGroup.Item action variant="dark">
                No Data Available
              </ListGroup.Item>
            }
        </div>
      
    </ListGroup>
    </div>
  )
}

export default CodeSelector;