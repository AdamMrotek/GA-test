import { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";

const GBP = new Intl.NumberFormat("en-UK", {
  style: "currency",
  currency: "GBP",
});
function App() {
  const [properties, setProperties] = useState(null);
  const [propertyQuery, setPropertyQuery] = useState("");
  const [error, setError] = useState(null);
  const [validInput, setValidInput] = useState(true);
  const [inputType, setInputType] = useState("Post code");

  async function fetchPropertyData(body) {
    // could be use as useFetchProperty
    let searchBy;
    switch (inputType) {
      case "Post code":
        searchBy = "outcode";
        break;
      case "Property Id":
        searchBy = "id";
        break;
      case "Address":
        searchBy = "street";
        break;
      default:
        searchBy = "ID";
        break;
    }
    try {
      const resp = await fetch("/find-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyQuery, searchBy }),
      });

      const properties = await resp.json();
      if (properties.length > 0) {
        setError("We can't find the property");
        return;
      }
      setProperties(properties.lrProperty);
    } catch (error) {
      setError("We can't find the property");
    }
  }
  function handleInput(e) {
    setValidInput(true);
    setPropertyQuery(e.target.value);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const isValidInput = validatePropertyInput(propertyQuery);
    if (isValidInput) {
      fetchPropertyData(propertyQuery);
      return;
    }
    //creates some message above the input
    setValidInput(false);
  }
  function validatePropertyInput(userInput) {
    //some smart regex testing valid :
    // only numbers and right number of them for property ID
    //or contains outcodes
    // or street name

    return !!userInput;
  }
  useEffect(() => {
    console.log(inputType);
    console.log(properties);
  });

  return (
    <div className="App">
      <div className="container">
        <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
          <span className="fs-4">Find properties</span>
        </header>
      </div>
      <div className="mb-3 container-sm d-flex justify-content-center flex-column align-items-center">
        <form className="property-input-form" onSubmit={handleSubmit}>
          <div className="mb-3 container-sm ">
            <label htmlFor="exampleInputEmail1" className="form-label">
              Property ID, postcode or street:
            </label>
            <input
              type="text"
              className="form-control"
              id="PropertyInput"
              aria-describedby="Property Input"
              value={propertyQuery}
              onChange={handleInput}
            />

            <div className="form-group">
              <label htmlFor="searchType">Search By:</label>
              <select
                className="form-control"
                id="searchType"
                value={inputType}
                onChange={(event) => setInputType(event.target.value)}
              >
                <option>Post code</option>
                <option>Address</option>
                <option>Property Id</option>
              </select>
            </div>

            <div id="emailHelp" className="form-text">
              We provide informations on <b>E1</b>, <b>E2</b>, <b>E10</b>, and,{" "}
              <b>E11</b> outcodes!
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
        {error && <div>{error}</div>}
        {
          //could be a seperate component with passing props
        }
        {properties
          ? properties.map((propertyData) => (
              <div key={propertyData.id} className="small-box m-5">
                <strong>
                  {propertyData.street} - {propertyData.outcode}{" "}
                  {propertyData.incode}
                </strong>
                <div className="m-2">Transactions:</div>
                <ul className="list-group list-group-flush">
                  {propertyData.lrTransactions.map((tr) => (
                    <li key={tr.id} className="list-group-item">
                      {tr.date} : {GBP.format(tr.price)}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export default App;
