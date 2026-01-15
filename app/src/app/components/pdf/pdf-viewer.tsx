"use client";

import { Component, useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
//import "react-pdf/dist/Page/TextLayer.css";
//import "react-pdf/dist/Page/AnnotationLayer.css";

//pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface FileObject{
  type:string;
  url:string;
}
type Props = {
  file?: File|FileObject;
};

interface State {
  numPages: number;
  pageNumber: number;
  fileUrl?: string;
}
/*
export default class PdfViewer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pageNumber: 1, 
      numPages: 0,
    };
    this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
  }
 
  
  componentDidUpdate(prevProps: Props) {
    debugger
    if (this.props.file && this.props.file !== prevProps.file) {
      if(this.props.file instanceof File){
        const fileUrl = URL.createObjectURL(this.props.file);
        
        this.setState({
          fileUrl,
          pageNumber: 1,
        });
      }else
      {
        const fileUrl:string=this.props.file.url;
        this.setState({
          fileUrl,
          pageNumber: 1,
        });
        
      }
    }
  }

  componentWillUnmount() {
    if (this.state.fileUrl) {
      URL.revokeObjectURL(this.state.fileUrl);
    }
  }

  onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    this.setState({ numPages });
  }

  render() {
    const { fileUrl, pageNumber } = this.state;

    if (!fileUrl) return <div>No file loaded</div>;

    return (
      <div className="Component">
        <Document
          file={fileUrl}
          onLoadSuccess={this.onDocumentLoadSuccess}
          
          onLoadError={(err) => console.error("PDF error:", err)}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
    );
  }
}
*/
export default function PdfViewer({ file }: Props) {
  const [fileUrl, setFileUrl] = useState<string>();
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);

  // Handle file changes
  useEffect(() => {
    if (!file) return;

    let url: string;

    if (file instanceof File) {
      url = URL.createObjectURL(file);
    } else {
      url = file.url;
    }

    setFileUrl(url);
    setPageNumber(1);

    return () => {
      if (file instanceof File) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  if (!fileUrl) return <div>No file loaded</div>;

  return (
    <div className="Component">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(err) => console.error("PDF error:", err)}
      >
        <Page pageNumber={pageNumber} />
      </Document>
    </div>
  );
}
