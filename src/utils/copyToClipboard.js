//src/utils/copyToClipboatrd.js
export const copyToClipboard = (text) => {
  // Create a temporary textarea element to hold the text
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);

  // Select the text inside the textarea
  textarea.select();
  textarea.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text to the clipboard
  document.execCommand("copy");

  // Remove the textarea from the document
  document.body.removeChild(textarea);

  // Optional: Return a confirmation message or boolean
  return true;
};
