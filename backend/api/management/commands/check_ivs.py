from uuid import uuid4

import boto3
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Verify Amazon IVS channel and stream-key permissions, then remove the test resources."

    def handle(self, *args, **options):
        client = boto3.client("ivs", region_name=settings.AWS_IVS_REGION)
        channel_arn = None
        stream_key_arn = None
        failed_stage = "create_channel"
        failure_code = None

        try:
            channel_response = client.create_channel(
                name=f"gospread-check-{uuid4().hex[:12]}",
                latencyMode="LOW",
                type="STANDARD",
            )
            channel = channel_response["channel"]
            stream_key = channel_response["streamKey"]
            channel_arn = channel["arn"]
            stream_key_arn = stream_key["arn"]

            failed_stage = "get_stream"
            try:
                client.get_stream(channelArn=channel_arn)
            except Exception as error:
                error_code = getattr(error, "response", {}).get("Error", {}).get("Code", "")
                if error_code not in {"ResourceNotFoundException", "ChannelNotBroadcasting"}:
                    raise

            failed_stage = "stop_stream"
            try:
                client.stop_stream(channelArn=channel_arn)
            except Exception as error:
                error_code = getattr(error, "response", {}).get("Error", {}).get("Code", "")
                if error_code not in {"ResourceNotFoundException", "ChannelNotBroadcasting"}:
                    raise
        except Exception as error:
            failure_code = getattr(error, "response", {}).get("Error", {}).get("Code", type(error).__name__)

        cleanup_failures = []
        if stream_key_arn:
            try:
                client.delete_stream_key(arn=stream_key_arn)
            except Exception as error:
                error_code = getattr(error, "response", {}).get("Error", {}).get("Code", type(error).__name__)
                cleanup_failures.append(("delete_stream_key", error_code))
        if channel_arn:
            try:
                client.delete_channel(arn=channel_arn)
            except Exception as error:
                error_code = getattr(error, "response", {}).get("Error", {}).get("Code", type(error).__name__)
                cleanup_failures.append(("delete_channel", error_code))

        if failure_code:
            cleanup_detail = f" Cleanup also failed: {cleanup_failures}." if cleanup_failures else ""
            raise CommandError(
                f"IVS check failed at {failed_stage} in {settings.AWS_IVS_REGION} ({failure_code}).{cleanup_detail}"
            )
        if cleanup_failures:
            raise CommandError(f"IVS resources were created, but cleanup failed: {cleanup_failures}.")

        self.stdout.write(self.style.SUCCESS(
            f"IVS credentials and create/read/stop/delete permissions are working in {settings.AWS_IVS_REGION}; "
            "temporary resources were removed."
        ))