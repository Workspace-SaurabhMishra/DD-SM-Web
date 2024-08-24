import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { copyToClipboard } from "./utils/copyToClipboard";
import logo from "./assets/logo_white.png";
import Popup from "./Popup";

const CodeEditor = () => {
  const [platformId, setPlatformId] = useState("");
  const [regex, setRegex] = useState("");
  const [urlContent, setUrlContent] = useState("");
  const [validationOutput, setValidationOutput] = useState("");
  const [content, setContent] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    type: "",
    image: null,
  });
  const navigate = useNavigate();

  // Function to show popup
  const showPopup = (message, type, image = null) => {
    setPopup({ visible: true, message, type, image });
  };

  // Function to hide popup
  const hidePopup = () => {
    setPopup({ ...popup, visible: false });
  };

  // Fetch platform list on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:8977/platforms", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        const platforms = response.data.data;
        localStorage.setItem("platforms", JSON.stringify(platforms));
      })
      .catch((error) => {
        handleApiError(error);
      });
  }, [navigate]);

  // Function to handle API errors and session timeout
  const handleApiError = (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      showPopup(
        "Session timeout or unauthorized access. Redirecting to login...",
        "error"
      );
      localStorage.removeItem("access_token");
      navigate("/login");
    } else {
      showPopup(
        "An error occurred: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  // Optimized function to fetch platform suggestions from localStorage
  const fetchSuggestions = (value) => {
    const platforms = JSON.parse(localStorage.getItem("platforms")) || [];
    const filtered = platforms.filter((platform) =>
      platform.platform_id.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handlePlatformChange = (e) => {
    const value = e.target.value;
    setPlatformId(value);
    if (value.length > 0) {
      fetchSuggestions(value); // Fetch suggestions if input length > 0
    } else {
      setSuggestions([]); // Clear suggestions if input is too short
    }
  };

  const selectSuggestion = (suggestion) => {
    setPlatformId(suggestion.platform_id);
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleSave = () => {
    const accessToken = localStorage.getItem("access_token");
    axios
      .post(
        "http://localhost:8977/scripts/create",
        { platformId, url: btoa(regex), content },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        showPopup("File saved successfully!", "info");
      })
      .catch(handleApiError);
  };

  const handleRead = () => {
    const accessToken = localStorage.getItem("access_token");
    axios
      .get("http://localhost:8977/scripts/read", {
        params: { platformId, url: btoa(regex) },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setContent(response.data.content);
      })
      .catch(handleApiError);
  };

  const handleUpdate = () => {
    const accessToken = localStorage.getItem("access_token");
    axios
      .post(
        "http://localhost:8977/scripts/update",
        { platformId, url: btoa(regex), content },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        showPopup("File updated successfully!", "info");
      })
      .catch(handleApiError);
  };

  const handleDelete = () => {
    const accessToken = localStorage.getItem("access_token");
    axios
      .get("http://localhost:8977/scripts/delete", {
        params: { platformId, url: btoa(regex) },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        setContent("");
        showPopup("File deleted successfully!", "info");
      })
      .catch(handleApiError);
  };

  // Regex Validation Logic
  const handleValidate = () => {
    if (!regex) {
      showPopup("Please enter a regex.", "error");
      return;
    }

    const regexPattern = new RegExp(regex);
    const urls = urlContent.split("\n\n");
    const output = urls
      .map((url) => `${regexPattern.test(url) ? "Match" : "Not Match"}`)
      .join("\n");

    setValidationOutput(output);
  };

  // Determine if the buttons should be enabled
  const isFormValid = platformId !== "" && regex !== "";

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#121212",
        color: "#e0e0e0",
        minHeight: "100vh",
      }}
    >
      {popup.visible && (
        <Popup
          message={popup.message}
          type={popup.type}
          image={popup.image}
          onClose={hidePopup}
        />
      )}
      <h2 style={{ display: "flex", alignItems: "center", color: "#00bcd4" }}>
        <img
          src={logo}
          alt="Dealer Daddy Logo"
          style={{ marginRight: "10px", height: "60px" }}
        />
        Script Management
      </h2>
      <div style={{ marginBottom: "10px", position: "relative" }}>
        <input
          type="text"
          placeholder="Platform ID"
          value={platformId}
          onChange={handlePlatformChange}
          style={{
            marginRight: "10px",
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
            border: "1px solid #444",
            padding: "8px",
            borderRadius: "4px",
          }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              position: "absolute",
              backgroundColor: "#1e1e1e",
              border: "1px solid #444",
              maxHeight: "150px",
              overflowY: "auto",
              width: "200px",
              zIndex: 1000,
              marginTop: "5px",
              listStyle: "none",
              paddingLeft: 0,
              color: "#ffffff",
            }}
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.platform_id}
                onClick={() => selectSuggestion(suggestion)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #444",
                }}
              >
                {suggestion.platform_id}
              </li>
            ))}
          </ul>
        )}
        <input
          type="text"
          placeholder="URL Regex"
          value={regex}
          onChange={(e) => setRegex(e.target.value)}
          style={{
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
            border: "1px solid #444",
            padding: "8px",
            borderRadius: "4px",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Editor
          height="75vh"
          width="65%"
          language="javascript"
          theme="vs-dark"
          value={content}
          onChange={(value) => setContent(value || "")}
        />
        <div style={{ width: "30%", paddingLeft: "10px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label>Regex Input:</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#1e1e1e",
                  color: "#ffffff",
                  border: "1px solid #444",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              />
              <button
                onClick={() => copyToClipboard(regex)}
                style={{
                  marginLeft: "5px",
                  backgroundColor: "#00bcd4",
                  color: "#ffffff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Copy
              </button>
            </div>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>URL Input:</label>
            <textarea
              value={urlContent}
              onChange={(e) => setUrlContent(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                backgroundColor: "#1e1e1e",
                color: "#ffffff",
                border: "1px solid #444",
                padding: "8px",
                borderRadius: "4px",
              }}
            ></textarea>
          </div>
          <button
            onClick={handleValidate}
            style={{
              marginBottom: "10px",
              backgroundColor: "#00bcd4",
              color: "#ffffff",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Validate
          </button>
          <div>
            <label>Validation Output:</label>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                color: "#ffffff",
                backgroundColor: "#1e1e1e",
                border: "1px solid #444",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              {validationOutput}
            </pre>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={handleSave}
          style={{
            marginRight: "10px",
            backgroundColor: "#00bcd4",
            color: "#ffffff",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          disabled={!isFormValid}
        >
          Save
        </button>
        <button
          onClick={handleRead}
          style={{
            marginRight: "10px",
            backgroundColor: "#00bcd4",
            color: "#ffffff",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          disabled={!isFormValid}
        >
          Read
        </button>
        <button
          onClick={handleUpdate}
          style={{
            marginRight: "10px",
            backgroundColor: "#00bcd4",
            color: "#ffffff",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          disabled={!isFormValid}
        >
          Update
        </button>
        <button
          onClick={handleDelete}
          style={{
            backgroundColor: "#f44336",
            color: "#ffffff",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          disabled={!isFormValid}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
