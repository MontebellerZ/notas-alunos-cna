import "dotenv/config";

const CNA_URL = process.env.CNA_URL;
if (!CNA_URL) throw new Error("CNA_URL não definida no .env");

const envData = {
  CNA_URL,
};

export default envData;
