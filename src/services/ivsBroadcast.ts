import * as IVSBroadcastClient from 'amazon-ivs-web-broadcast';

export interface IvsBroadcastCredentials {
  ingest_endpoint: string;
  stream_key: string;
  playback_url: string;
}

export async function startIvsBroadcast(
  mediaStream: MediaStream,
  credentials: IvsBroadcastCredentials,
): Promise<IVSBroadcastClient.AmazonIVSBroadcastClient> {
  if (!IVSBroadcastClient.isSupported()) {
    throw new Error('This browser does not support Amazon IVS broadcasting.');
  }

  const client = IVSBroadcastClient.create({
    streamConfig: IVSBroadcastClient.STANDARD_LANDSCAPE,
    ingestEndpoint: credentials.ingest_endpoint,
  });

  try {
    await client.addVideoInputDevice(mediaStream, 'camera', {
      index: 0,
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
    });
    await client.addAudioInputDevice(mediaStream, 'microphone');
    const error = await client.startBroadcast(credentials.stream_key, credentials.ingest_endpoint);
    if (error) throw error;
    return client;
  } catch (error) {
    client.delete();
    throw error;
  }
}

export function stopIvsBroadcast(client: IVSBroadcastClient.AmazonIVSBroadcastClient | null): void {
  if (!client) return;
  client.stopBroadcast();
  client.delete();
}