    async def fetch_youtube_data(self, artist_names: List[str]) -> Dict[str, int]:
        """
        Fetch YouTube data for artists.
        Returns dict mapping artist_name -> mention_count (video count).
        """
        try:
            app_logger.info("Starting YouTube data fetch")

            if not settings.YOUTUBE_API_KEY:
                app_logger.warning("YouTube API key not configured, skipping")
                return {}

            artist_mentions = {}

            # Search for each artist on YouTube
            for artist_name in artist_names[:10]:  # Limit to 10 artists to conserve quota
                try:
                    # Search for artist music videos
                    query = f"{artist_name} music official"
                    videos = await youtube_fetcher.search_videos(query, max_results=5)

                    if videos:
                        # Count as mentions (number of recent videos found)
                        artist_mentions[artist_name] = len(videos)

                        # Get video IDs for statistics
                        video_ids = [v.get("video_id") for v in videos if v.get("video_id")]

                        if video_ids:
                            # Get detailed statistics
                            video_stats = await youtube_fetcher.get_video_statistics(video_ids)

                            # Calculate total engagement
                            total_views = sum(v.get("view_count", 0) for v in video_stats)
                            total_likes = sum(v.get("like_count", 0) for v in video_stats)

                            app_logger.debug(
                                f"{artist_name}: {len(videos)} videos, "
                                f"{total_views:,} views, {total_likes:,} likes"
                            )

                    # Small delay to respect rate limits
                    await asyncio.sleep(0.5)

                except Exception as e:
                    app_logger.error(f"Error fetching YouTube data for {artist_name}: {e}")
                    continue

            app_logger.info(f"Fetched YouTube data for {len(artist_mentions)} artists")
            return artist_mentions

        except Exception as e:
            app_logger.error(f"Error in YouTube data fetch: {e}")
            return {}
