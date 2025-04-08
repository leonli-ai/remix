// PDF, JPEG, PNG, or BMP , 10MB

import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Button,
  Card,
  DropZone,
  Modal,
  Page,
  ProgressBar,
  Select,
  Spinner,
} from "@shopify/polaris";
import _ from "lodash";
import { FileCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import ChangeLanguageSelector from "~/components/admin-portal/ChangeLanguageSelctor";
import { PoAutomationPreview } from "~/components/admin-portal/po-automation-preview";
import { useParsePoFile, useUploadPoFile } from "~/hooks/use-po-automation";
import { flatParseResultsLocationOptions } from "~/lib/po-automation";
import { authenticate } from "~/shopify.server";
import { PoFileUploadResponse } from "~/types/purchase-order/file-upload.schema";
import { PoParserResponse } from "~/types/purchase-order/po-parser.schema";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export default function POAutomation() {
  const { shop: storeName } = useLoaderData<typeof loader>();

  const [step, setStep] = useState(0);
  const { t } = useTranslation();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const allowedTypes = [
    "application/pdf", // .pdf
    "image/jpeg", // .jpeg
    "image/png", // .png
    "image/bmp", // .bmp
  ];
  const allowedExtensions = [".pdf", ".jpeg", ".png", ".bmp"];

  const validateFile = (file: File | undefined): boolean => {
    if (!file) {
      return false;
    }

    if (
      (!allowedTypes.includes(file.type) &&
        !allowedExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext),
        )) ||
      file.size > MAX_FILE_SIZE
    ) {
      return false;
    }
    return true;
  };

  const [file, setFile] = useState<File>();

  const fileUpload = !file && (
    <DropZone.FileUpload
      actionHint={t("admin-portal.po-automation.upload-file-placeholder")}
      actionTitle={t("admin-portal.po-automation.upload-file")}
    />
  );

  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadPoFile();
  const { mutateAsync: parsePoFile, isPending: isParsing } = useParsePoFile();

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locationOptions, setLocationOptions] = useState<
    { label: string; value: string; metaData: any }[]
  >([]);

  const [statusText, setStatusText] = useState<
    "Waiting" | "Uploading" | "Parsing" | "Success" | "Error"
  >("Waiting");

  const [progress, setProgress] = useState<number>(0);
  const [progressTone, setProgressTone] = useState<"success" | "critical">(
    "success",
  );

  const [poData, setPoData] = useState<PoParserResponse>();
  const [poFileData, setPoFileData] = useState<{
    url: string;
    fileType: string;
  }>();
  const [poDataLocations, setPoDataLocations] = useState<
    PoParserResponse["data"]["companyContactProfiles"][0]["company"]["locations"]
  >([]);

  const handleSelectLocation = () => {
    const location = poDataLocations?.find(
      (location) => location.id === selectedLocation,
    );
    if (!location) {
      return;
    }

    setPoData({
      ...poData,
      companyContactProfiles: [
        {
          ...poData?.companyContactProfiles?.[0],
          company: {
            ...poData?.companyContactProfiles?.[0]?.company,
            locations: [location],
          },
        },
      ],
    });

    setModalOpen(false);
    setStep(1);
  };

  const switchProgressError = () => {
    setProgressTone("critical");
    setStatusText("Error");
  };

  const randomProgress = useCallback(() => {
    if (progress < 95) {
      // max progress 95%, leave buffer space
      const increment = Math.random() * 5 + 5; // random number between 5-10
      const newProgress = Math.min(95, progress + increment);
      setProgress(newProgress);
    }
  }, [progress]);

  const reset = () => {
    setProgress(0);
    setPoData(undefined);
    setStatusText("Waiting");
    setSelectedLocation("");
    setLocationOptions([]);
    setPoDataLocations([]);
    setPoFileData(undefined);
  };

  useEffect(() => {
    // reset progress
    reset();
  }, [file]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!file) {
      setStatusText("Waiting");
      setProgress(0);
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }

    const delay = Math.random() * 500 + 500; // random number between 500-1000ms

    if (isUploading && progress < 35) {
      intervalId = setInterval(randomProgress, delay);
    }

    if (isParsing && progress < 95) {
      intervalId = setInterval(randomProgress, delay);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isUploading, isParsing, progress, randomProgress]);

  const doParsePoFile = (res: PoFileUploadResponse) => {
    // when file is uploaded, parse it
    parsePoFile({
      url: res.fileUrl,
      storeName: storeName,
      fileType: res.fileType,
    })
      .then((res) => {
        if (res.success) {
          setProgress(100);

          const { data } = res;

          if (!data?.isValid) {
            if (
              data?.companyContactProfiles?.[0]?.company?.locations.length > 1
            ) {
              toast.error(
                res?.message ||
                  t("admin-portal.po-automation.parse-file-error"),
              );
              setModalOpen(true);
              const options = flatParseResultsLocationOptions(data);
              setLocationOptions(options);
              setPoDataLocations(
                data?.companyContactProfiles?.[0]?.company?.locations,
              );
              setPoData(data);

              return;
            }

            switchProgressError();
            return toast.error(
              data?.errorMessage ||
                t("admin-portal.po-automation.parse-file-error"),
            );
          }

          setPoData(data);
          setStatusText("Success");
          setStep(1);
          toast.success(t("admin-portal.po-automation.parse-file-success"));
        } else {
          switchProgressError();
          console.error("parsePoFile error", res);
          if (res?.validationErrors && _.isArray(res?.validationErrors)) {
            toast.error(
              res?.message || t("admin-portal.po-automation.parse-file-error"),
              {
                description: (
                  <div className="flex flex-col gap-2">
                    {res?.validationErrors?.map((error, index) => (
                      <div key={error}>
                        {index + 1}. {error}
                      </div>
                    ))}
                  </div>
                ),
                duration: 3000,
              },
            );
          } else {
            toast.error(
              res?.message || t("admin-portal.po-automation.parse-file-error"),
            );
          }
        }
      })
      .catch((err) => {
        switchProgressError();
        console.error("parsePoFile error", err);
        toast.error(
          err?.message || t("admin-portal.po-automation.parse-file-error"),
        );
      });
  };

  const handleUploadFile = () => {
    if (!file) return;
    setProgress(0);
    setStatusText("Uploading");
    setProgressTone("success");
    uploadFile({
      file: file,
      storeName: storeName,
    })
      .then((res) => {
        if (res.success) {
          setStatusText("Parsing");
          setPoFileData({
            url: res.fileUrl,
            fileType: res.fileType,
          });

          doParsePoFile(res);

          return;
        }
        switchProgressError();
        toast.error(
          res?.message || t("admin-portal.po-automation.upload-file-error"),
        );
        console.error("uploadFile error", res);
      })
      .catch((err) => {
        switchProgressError();
        console.error("uploadFile error", err);
        toast.error(
          err?.message || t("admin-portal.po-automation.upload-file-error"),
        );
      });
  };
  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      if (!validateFile(acceptedFiles[0])) {
        toast.error(t("admin-portal.po-automation.upload-file-type-error"));
      } else {
        setFile(acceptedFiles[0]);
      }
    },
    [],
  );
  const uploadedFile = file && (
    <div className="flex flex-col items-center justify-center gap-2 h-full">
      <div className="flex items-center justify-center gap-2">
        <FileCheck />
        <div>{file.name}</div>
      </div>
    </div>
  );

  return (
    <div>
      {step === 0 ? (
        <Page>
          <Modal
            open={modalOpen}
            title={t("admin-portal.po-automation.modal.choose-location.title")}
            onClose={() => {
              setModalOpen(false);
            }}
          >
            <div className="p-6">
              <div className="text-gray-600 mb-2">
                {t(
                  "admin-portal.po-automation.modal.choose-location.description",
                )}
              </div>
              <Select
                label={t(
                  "admin-portal.po-automation.modal.choose-location.select-label",
                )}
                placeholder={t(
                  "admin-portal.po-automation.modal.choose-location.select-placeholder",
                )}
                options={locationOptions}
                value={selectedLocation}
                onChange={(value) => setSelectedLocation(value)}
              />
              <div className="flex justify-end mt-4">
                <Button
                  variant="primary"
                  onClick={handleSelectLocation}
                  disabled={!selectedLocation}
                >
                  {t(
                    "admin-portal.po-automation.modal.choose-location.confirm",
                  )}
                </Button>
              </div>
            </div>
          </Modal>
          <div className="flex justify-end mb-4">
            <ChangeLanguageSelector />
          </div>
          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <div className="text-lg font-bold">
                  {t("admin-portal.po-automation.title")}
                </div>
                <div className="flex gap-2">
                  {poData &&
                    poData?.companyContactProfiles?.[0]?.company?.locations
                      ?.length === 1 && (
                      <Button variant="primary" onClick={() => setStep(1)}>
                        {t("admin-portal.po-automation.preview-button")}
                      </Button>
                    )}
                  {poData && poDataLocations?.length > 1 && (
                    <Button
                      variant="primary"
                      onClick={() => setModalOpen(true)}
                    >
                      {t("admin-portal.po-automation.choose-location-button")}
                    </Button>
                  )}
                  <Button
                    disabled={!file || isUploading || isParsing || poData}
                    onClick={handleUploadFile}
                  >
                    {t("admin-portal.po-automation.upload-file-button")}
                  </Button>
                </div>
              </div>
              <DropZone
                allowMultiple={false}
                onDrop={handleDropZoneDrop}
                disabled={isUploading || isParsing}
              >
                {uploadedFile}
                {fileUpload}
              </DropZone>

              {file && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    {(isUploading || isParsing) && <Spinner size="small" />}
                    <div className="font-bold">
                      {t(
                        `admin-portal.po-automation.status.${_.toLower(
                          statusText,
                        )}`,
                      )}
                    </div>
                    <div>{`(${Math.round(progress)}%)`}</div>
                  </div>
                  <ProgressBar
                    size="small"
                    progress={progress}
                    tone={progressTone}
                  ></ProgressBar>
                </div>
              )}
            </div>
          </Card>
        </Page>
      ) : (
        <PoAutomationPreview
          onBackAction={() => setStep(0)}
          parserData={poData}
          storeName={storeName}
          reset={() => setFile(undefined)}
          poFileData={poFileData}
        />
      )}
    </div>
  );
}
