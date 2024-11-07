// background.js

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const API_KEY = 'API_KEY';

      function fetchFromYouTubeAPI(url) {
        return fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch data.');
            }
            return response.json();
          });
      }

      function getChannelID() {
        return new Promise((resolve, reject) => {
          const videoIdMatch = window.location.href.match(/[?&]v=([a-zA-Z0-9_-]+)/);
          if (videoIdMatch) {
            // if the user is on a video page, fetch channel ID from video ID
            const videoID = videoIdMatch[1];
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${API_KEY}`;
            fetchFromYouTubeAPI(apiUrl)
              .then(data => {
                const channelId = data.items[0]?.snippet?.channelId;
                if (channelId) resolve(channelId);
                else reject('Channel ID not found in video data.');
              })
              .catch(reject);
          } else {
            // if the user is on an old channel page, fetch channel ID from url
            const channelMatch = window.location.href.match(/youtube\.com\/(c|channel)\/([a-zA-Z0-9_-]+)/);
            if (channelMatch) {
              resolve(channelMatch[2]);
            } else {
              // if the user is on an new channel page, fetch channel ID from handle
              const customMatch = window.location.href.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
              if (customMatch) {
                const handle = customMatch[1];
                const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${API_KEY}`;
                fetchFromYouTubeAPI(apiUrl)
                  .then(data => resolve(data.items[0]?.id))
                  .catch(reject);
              } else {
                reject('No channel or video page detected.');
              }
            }
          }
        });
      }

      function redirectToPlaylist(channelID) {
        if (channelID) {
          try {
            const playlistURL = `https://www.youtube.com/playlist?list=UU${channelID.substr(2)}`;
            console.log(`Redirecting to playlist: ${playlistURL}`);
            window.location.href = playlistURL;
          } catch (error) {
            console.error('Error generating playlist URL:', error);
          }
        } else {
          console.error('No channel ID available. Cannot redirect to playlist.');
        }
      }

      getChannelID()
        .then(channelID => {
          if (channelID) {
            redirectToPlaylist(channelID);
          } else {
            console.error('No channel ID found.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  });
});
