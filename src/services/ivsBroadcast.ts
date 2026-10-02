import * as IVSBroadcastClient from 'amazon-ivs-web-broadcast';
import { BroadcastClientError, BroadcastClientEvents, ConnectionState } from 'amazon-ivs-web-broadcast';

export interface IvsBroadcastCredentials {
  ingest_endpoint: string;
  stream_key: string;
  playback_url: string;
}

export type IvsConnectionState = ConnectionState;

export function listenToIvsConnection(
  client: IVSBroadcastClient.AmazonIVSBroadcastClient,
  onStateChange: (state: ConnectionState) => void,
  onError: (error: BroadcastClientError) => void,
): () => void {
  const handleStateChange = (...args: unknown[]) => {
    const state = args[0] as ConnectionState | undefined;
    if (state) onStateChange(state);
  };
  const handleError = (...args: unknown[]) => {
    const error = args[0] as BroadcastClientError | undefined;
    if (error) onError(error);
  };

  client.on(BroadcastClientEvents.CONNECTION_STATE_CHANGE, handleStateChange);
  client.on(BroadcastClientEvents.ERROR, handleError);

  return () => {
    client.off(BroadcastClientEvents.CONNECTION_STATE_CHANGE, handleStateChange);
    client.off(BroadcastClientEvents.ERROR, handleError);
  };
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
    networkReconnectConfig: { reconnect: true, timeout: 30000 },
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