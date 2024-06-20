export const sendComment = () -> {
    fetch(process.env.EXPO_PUBLIC_COMMENT_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash: "mockHash",
          avatar: recipient.avatar,
          username: recipient.username,
          comment: comment,
          address: senderAddress,
        }), 
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
}