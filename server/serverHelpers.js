require('dotenv').config();
const request = require('request');

function extractPlaylistData(data) {
  const parsedData = JSON.parse(data)
  const playlistData = [];
  parsedData.playlists.items.forEach((playlist) => {
    playlistData.push({ playlist_id: playlist.id, user_id: playlist.owner.id })
  })
  return playlistData;
}

function extractTrackIDs(data) {
  const parsedData = JSON.parse(data);
  const trackIDs = [];
  parsedData.items.forEach((track) => {
    trackIDs.push(track.track.id);
  })
  return trackIDs;
}

module.exports = {
  getPlaylistsQuery: (query) => {
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://api.spotify.com/v1/search?q=${query}&type=playlist&limit=3`,
        headers: {
          'Authorization': `Bearer ${process.env.SPOTIFY_AUTH}`
        }
      };
      request(options, function(err, response, body) {
        if (response.statusCode === 200) {
          resolve(extractPlaylistData(body));
        } else {
          console.log('error: it fucking broke (getPlaylistsQuery)');
        }
      });
    });
  },
  getTracksInPlaylist: (user_id, playlist_id) => {
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}/tracks?limit=10`,
        headers: {
          'Authorization': `Bearer ${process.env.SPOTIFY_AUTH}`
        }
      };
      request(options, function(err, response, body) {
        if (response.statusCode === 200) {
          resolve(extractTrackIDs(body));
        } else {
          console.log('error: it fucking broke (getTracksInPlaylist)');
        }
      });
    });
  },
  createPlaylist: (owner_id, name) => {
    return new Promise((resolve, reject) => {
      const options = {
        url: `https://api.spotify.com/v1/users/${owner_id}/playlists`,
        method: 'POST',
        json: true,
        headers: {
          'Authorization': `Bearer ${process.env.SPOTIFY_AUTH}`
        },
        body: {
          "description": "created by activity-playlist",
          "public": false,
          "name": name
        }
      };
      request(options, function(err, response, body) {
        if (response.statusCode === 201) {
          resolve(body.id);
        } else {
          console.log('error: it fucking broke (createPlaylist)');
        }
      });
    });
  },
  addTracks: (user_id, playlist_id, tracks) => {
    const options = {
      url: `https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}/tracks`,
      method: 'POST',
      json: true,
      headers: {
        'Authorization': `Bearer ${process.env.SPOTIFY_AUTH}`
      },
      body: {
        "uris": tracks
      }
    };
    request(options, function(err, response, body) {
      if (response.statusCode === 201) {
        return body;
      } else {
        console.log('error: it fucking broke (addTracks)');
      }
    });
  }
};