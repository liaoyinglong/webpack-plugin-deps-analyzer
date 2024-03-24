import { Compiler } from "webpack";

class DepsAnalyzer {
  name = "DepsAnalyzer";
  apply(compiler: Compiler) {
    console.log("DepsAnalyzer is running...");
  }
}

export default DepsAnalyzer;
