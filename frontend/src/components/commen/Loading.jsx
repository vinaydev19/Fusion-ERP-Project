import { CircularProgress, Stack } from "@mui/material";
import React from "react";

function Loading({color = "success", size = "30px"}) {
  return (
    <Stack>
      <CircularProgress size={size} color={color} />
    </Stack>
  );
}

export default Loading;
