export async function fetchToken(channelName: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_AGORA_TOKEN_URL
            }/rtc/${channelName}/publisher/uid/${0}/?expiry=45`
        );
        const data = (await response.json()) as { rtcToken: string };
        if (!data.rtcToken) {
            alert("RTC token not found");
            throw "RTC token not found";
        }
        console.log("RTC token fetched from server: ", data.rtcToken);
        return data.rtcToken;
    } catch (error: any) {
        console.error(error);
        alert(`Error fetching RTC token: ${error.message}`);
        throw error;
    }
}