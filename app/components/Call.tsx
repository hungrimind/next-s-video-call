"use client";

import { fetchRTCToken } from "@/app/utils/token";
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
import { useEffect } from "react";
import Buttons from "./Buttons";

async function Call(props: { channelName: string }) {
  const client = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  );

  return (
    <AgoraRTCProvider client={client}>
      <VideoFeed
        channelName={props.channelName}
        initialToken={await fetchRTCToken(props.channelName)}
      />
    </AgoraRTCProvider>
  );
}

function VideoFeed(props: { channelName: string; initialToken: string }) {
  const { channelName, initialToken } = props;
  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  const client = useRTCClient();

  usePublish([localMicrophoneTrack, localCameraTrack]);
  useJoin({
    appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
    channel: channelName,
    token: initialToken,
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

  return (
    <div className="flex flex-col justify-between w-full h-screen">
      <div
        className={`grid gap-1 flex-1 ${
          remoteUsers.length > 9
            ? `grid-cols-4`
            : remoteUsers.length > 4
            ? `grid-cols-3`
            : remoteUsers.length >= 1
            ? `grid-cols-2`
            : `grid-cols-1`
        }`}
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
      <Buttons track={localMicrophoneTrack} />
    </div>
  );
}

export default Call;
