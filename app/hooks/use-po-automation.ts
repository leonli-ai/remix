import { useMutation } from "@tanstack/react-query";
import {
  uploadPoFile,
  parsePoFile,
  createOrder,
} from "~/request/po-automation";

export const useUploadPoFile = () => {
  return useMutation({
    mutationFn: uploadPoFile,
  });
};

export const useParsePoFile = () => {
  return useMutation({
    mutationFn: parsePoFile,
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrder,
  });
};
