"use client";

import AgoraRTC, {
  AgoraRTCProvider,
  LocalVideoTrack,
  RemoteUser,
  useClientEvent,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
} from "agora-rtc-react";
import { useEffect, useState } from "react";

async function Call(props: {
  appId: string;
  channelName: string;
  tokenUrl: string;
}) {
  const client = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  );

  async function fetchRTCToken(channelName: string) {
    try {
      const response = await fetch(
        `${props.tokenUrl}/rtc/${channelName}/publisher/uid/${0}/?expiry=45`
      );
      const data = (await response.json()) as { rtcToken: string };
      console.log("RTC token fetched from server: ", data.rtcToken);
      return data.rtcToken;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return (
    <AgoraRTCProvider client={client}>
      <Videos
        channelName={props.channelName}
        AppID={props.appId}
        token={await fetchRTCToken(props.channelName)}
        fetchRTCToken={fetchRTCToken}
      />
    </AgoraRTCProvider>
  );
}

function Videos(props: {
  channelName: string;
  AppID: string;
  token: string;
  fetchRTCToken: (channelName: string) => Promise<string>;
}) {
  const { AppID, channelName, token, fetchRTCToken } = props;
  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  const client = useRTCClient();
  const [isMuted, setIsMuted] = useState(false);

  usePublish([localMicrophoneTrack, localCameraTrack]);
  useJoin({
    appid: AppID,
    channel: channelName,
    token: token,
  });

  useClientEvent(client, "token-privilege-will-expire", () => {
    fetchRTCToken(props.channelName)
      .then((token) => {
        console.log("RTC token fetched from server: ", token);
        if (token) return client.renewToken(token);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  useEffect(() => {
    return () => {
      localCameraTrack?.close();
      localMicrophoneTrack?.close();
    };
  }, []);

  audioTracks.map((track) => track.play());
  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading)
    return (
      <div className="flex flex-col items-center pt-40">Loading devices...</div>
    );
  const unit = "minmax(0, 1fr) ";

  return (
    <div className="flex flex-col justify-between w-full h-screen p-1">
      <div
        className={`grid gap-1 flex-1`}
        style={{
          gridTemplateColumns:
            remoteUsers.length > 9
              ? unit.repeat(4)
              : remoteUsers.length > 4
              ? unit.repeat(3)
              : remoteUsers.length >= 1
              ? unit.repeat(2)
              : unit,
        }}
      >
        <LocalVideoTrack
          track={localCameraTrack}
          play={true}
          className="w-full h-full"
        />
        {remoteUsers.map((user) => (
          <RemoteUser user={user} />
        ))}
      </div>
      <div className="fixed z-10 bottom-0 left-0 right-0 flex justify-center pb-4">
        <div className="flex space-x-4">
          <a
            className="px-5 py-3 text-base font-medium text-center text-white bg-red-400 rounded-lg hover:bg-red-500 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 w-40"
            href="/"
          >
            End Call
          </a>
          <button
            className="px-5 py-3 text-base font-medium text-center text-white bg-gray-400 rounded-lg hover:bg-gray-500 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 w-40"
            onClick={() => {
              setIsMuted(!isMuted);
              localMicrophoneTrack?.setEnabled(isMuted);
            }}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Call;
