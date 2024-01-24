/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import axios from "axios";
import getConfig from 'next/config';
// import 'antd/dist/antd.css';
import WalletSeed from '../../contexts/wallet/creator.json';
import * as anchor from '@project-serum/anchor';

import {
  useWallet,
} from '@solana/wallet-adapter-react';
import { MintLayout } from '@solana/spl-token';
import {
  AccountInfo,
  Connection,
  LAMPORTS_PER_SOL,
  PartiallyDecodedInstruction,
  ParsedInstruction,
  PublicKey,
  ParsedConfirmedTransaction,
  ConfirmedSignatureInfo,
  clusterApiUrl,
  TokenBalance,
  Keypair
} from "@solana/web3.js";
import {
  DIGITALEYES_DIRECTSELL_PROGRAM_PUBKEY,
  DIGITALEYES_PROGRAM_PUBKEY,
  EXCHANGE_PROGRAM_PUBKEY,
  MAGIC_EDEN_PROGRAM_PUBKEY,
  SOLANART_PROGRAM_PUBKEY,
  SOLANA_MAINNET,
  SOLANA_MAINNET_SERUM,
  TOKEN_METADATA_PROGRAM_ID,
  SOLANA_TRX_FEE, SOLSEA_PROGRAM_PUBKEY,

} from '../config';
import { css } from "@emotion/react";
import ClipLoader from "react-spinners/ClipLoader";
import { programs } from '@metaplex/js';

import {
  MetadataCategory,
  IMetadataExtension,
  StringPublicKey,
  MetadataFile,
  getAssetCostToStore,
  getLast,
  shortenAddress,
  LAMPORT_MULTIPLIER
} from '../../utils'
import {
  Creator,
  MAX_METADATA_LEN
} from '../../contexts/actions/metadata'
// import {
//   useConnection,
//   useConnectionConfig
// } from '../../contexts/connection';

import {
  Confetti
} from '../Confetti'
import styles from './index.module.css'
const { metadata: { Metadata } } = programs;

import {
  Steps,
  Row,
  Button,
  Upload,
  Col,
  Input,
  Statistic,
  Slider,
  Spin,
  InputNumber,
  Form,
  Typography,
  Space,
  Card,
  Checkbox,
} from 'antd';

import { mintNFT } from 'contexts/actions/nft';
const { Step } = Steps;
const { Dragger } = Upload;
const { Text } = Typography;
interface Data {
  symbol: string;
  amount: number;
  price: number;
  coingeckoId: string;
  logoUrl: string;
}
import {
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';


interface Props {
  searchAddress: string,
}

var rows: Array<Data>;// = [createData('Cupcake', 305, 3.7, 67, 4.3)];

const { publicRuntimeConfig } = getConfig();
const SOLANA_NETWORK = publicRuntimeConfig.network;
const solConnection = new Connection(clusterApiUrl(SOLANA_NETWORK));
export const Dashboard = (props: Props) => {
  //

  const wallet = useWallet();
  const [files, setFiles] = React.useState<File[]>([]);
  const [nftCreateProgress, setNFTcreateProgress] = React.useState<number>(0);
  const [nft, setNft] = React.useState<{ metadataAccount: StringPublicKey } | undefined>(undefined);

  const [step, setStep] = React.useState<number>(1);
  const [stepsVisible, setStepsVisible] = React.useState<boolean>(false);
  const [attributes, setAttributes] = React.useState<IMetadataExtension>({
    name: '',
    symbol: '',
    description: '',
    external_url: '',
    image: '',
    animation_url: undefined,
    attributes: undefined,
    seller_fee_basis_points: 0,
    creators: [],
    properties: {
      files: [],
      category: MetadataCategory.Image,
    },
  });
  const [alertMessage, setAlertMessage] = React.useState<string>();
  const [isMinting, setMinting] = React.useState<boolean>(false);


  const gotoStep = React.useCallback(
    (_step: number) => {
      setStep(_step);
      // if (_step === 0) setStepsVisible(true);
    },
    [step],
  );

  const mint = async () => {
    const metadata = {
      name: attributes.name,
      symbol: attributes.symbol,
      creators: attributes.creators,
      description: attributes.description,
      sellerFeeBasisPoints: attributes.seller_fee_basis_points,
      image: attributes.image,
      animation_url: attributes.animation_url,
      attributes: attributes.attributes,
      external_url: attributes.external_url,
      properties: {
        files: attributes.properties.files,
        category: attributes.properties?.category,
      },
    };
    setStepsVisible(false);
    setMinting(true);

    try {
      console.log(metadata, "metadata");
      console.log(wallet, SOLANA_NETWORK, files, attributes.properties?.maxSupply)
      const _nft = await mintNFT(
        solConnection,
        wallet,
        SOLANA_NETWORK,
        files,
        metadata,
        setNFTcreateProgress,
        attributes.properties?.maxSupply,

      );

      if (_nft) setNft(_nft);
      setAlertMessage('');
    } catch (e: any) {
      setAlertMessage(e.message);
    } finally {
      setMinting(false);
    }
  };


  // React.useEffect(() => {
  // }, [gotoStep, step]);

  return (
    <div>
      <div>

        <h2>Create a new Item Step</h2>

        {/* {
            step === 0 &&
            <CategoryStep confirm={(category: MetadataCategory) => {
              setAttributes({
                ...attributes,
                properties: {
                  ...attributes.properties,
                  category,
                },
              });
              gotoStep(1);
            }} />
          } */}

        {step === 1 && (
          <UploadStep
            attributes={attributes}
            setAttributes={setAttributes}
            files={files}
            setFiles={setFiles}
            confirm={() => gotoStep(2)}
          />
        )}

        {step === 2 && (
          <InfoStep
            attributes={attributes}
            files={files}
            setAttributes={setAttributes}
            confirm={() => gotoStep(3)}
          />
        )}

        {step === 3 && (
          <RoyaltiesStep
            attributes={attributes}
            confirm={() => gotoStep(4)}
            setAttributes={setAttributes}
          />
        )}

        {step === 4 && (
          <LaunchStep
            attributes={attributes}
            files={files}
            confirm={() => gotoStep(5)}
            connection={solConnection}
          />
        )}
        {step === 5 && (
          <WaitingStep
            mint={mint}
            minting={isMinting}
            step={nftCreateProgress}
            confirm={() => gotoStep(6)}
          />
        )}
        {1 < step && step < 5 && (
          <div style={{ margin: 'auto', width: 'fit-content' }}>
            <button onClick={() => gotoStep(step - 1)}>Back</button>
          </div>
        )}
      </div>
      {
        step === 6 &&
        <Congrats nft={nft} alert={alertMessage} gotoStep1={() => {
          setAttributes({
            name: '',
            symbol: '',
            description: '',
            external_url: '',
            image: '',
            animation_url: undefined,
            attributes: undefined,
            seller_fee_basis_points: 0,
            creators: [],
            properties: {
              files: [],
              category: MetadataCategory.Image,
            },
          }); gotoStep(1);
        }} />
      }
    </div>
  );
}

const CategoryStep = (props: {
  confirm: (category: MetadataCategory) => void;
}) => {
  return (
    <div>
      <h3>Step 1 </h3>
      <button onClick={() => props.confirm(MetadataCategory.Image)}>Image</button>
      <button
        onClick={() => props.confirm(MetadataCategory.Video)}
      >Video</button>
      <button
        onClick={() => props.confirm(MetadataCategory.Audio)}

      >
        Audio
      </button>
      <button
        onClick={() => props.confirm(MetadataCategory.VR)}

      >
        AR/3D
      </button>
      <button
        onClick={() => props.confirm(MetadataCategory.HTML)}
      >
        HTML Asset
      </button>
    </div>
  )
}


const UploadStep = (props: {
  attributes: IMetadataExtension;
  setAttributes: (attr: IMetadataExtension) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  confirm: () => void;
}) => {
  const [coverFile, setCoverFile] = React.useState<File | undefined>(
    props.files?.[0],
  );
  const [mainFile, setMainFile] = React.useState<File | undefined>(props.files?.[1]);
  const [coverArtError, setCoverArtError] = React.useState<string>();

  const [customURL, setCustomURL] = React.useState<string>('');
  const [customURLErr, setCustomURLErr] = React.useState<string>('');
  const disableContinue = !coverFile || !!customURLErr;

  React.useEffect(() => {
    props.setAttributes({
      ...props.attributes,
      properties: {
        ...props.attributes.properties,
        files: [],
      },
    });
  }, []);

  const uploadMsg = (category: MetadataCategory) => {
    switch (category) {
      case MetadataCategory.Audio:
        return 'Upload your audio creation (MP3, FLAC, WAV)';
      case MetadataCategory.Image:
        return 'Upload your image creation (PNG, JPG, GIF)';
      case MetadataCategory.Video:
        return 'Upload your video creation (MP4, MOV, GLB)';
      case MetadataCategory.VR:
        return 'Upload your AR/VR creation (GLB)';
      case MetadataCategory.HTML:
        return 'Upload your HTML File (HTML)';
      default:
        return 'Please go back and choose a category';
    }
  };
  const acceptableFiles = (category: MetadataCategory) => {
    switch (category) {
      case MetadataCategory.Audio:
        return '.mp3,.flac,.wav';
      case MetadataCategory.Image:
        return '.png,.jpg,.gif';
      case MetadataCategory.Video:
        return '.mp4,.mov,.webm';
      case MetadataCategory.VR:
        return '.glb';
      case MetadataCategory.HTML:
        return '.html';
      default:
        return '';
    }
  };
  return (
    <>
      <Row className="content-action">
        <h3>Upload a cover image (PNG, JPG, GIF, SVG)</h3>
        <Dragger
          accept=".png,.jpg,.gif,.mp4,.svg"
          style={{ padding: 20, background: 'rgba(255, 255, 255, 0.08)' }}
          multiple={false}
          customRequest={info => {
            // dont upload files here, handled outside of the control
            info?.onSuccess?.({}, null as any);
          }}
          fileList={coverFile ? [coverFile as any] : []}
          onChange={async info => {
            const file = info.file.originFileObj;

            if (!file) {
              return;
            }

            const sizeKB = file.size / 1024;

            if (sizeKB < 25) {
              setCoverArtError(
                `The file ${file.name} is too small. It is ${Math.round(10 * sizeKB) / 10
                }KB but should be at least 25KB.`,
              );
              return;
            }

            setCoverFile(file);
            setCoverArtError(undefined);
          }}
          onDrop={e => {
            console.log('Dropped files', e.dataTransfer.files);
          }
          }
        >
          <div className="ant-upload-drag-icon">
            <h3 style={{ fontWeight: 700 }}>
              Upload your cover image (PNG, JPG, GIF, SVG)
            </h3>
          </div>
          {coverArtError ? (
            <Text >{coverArtError}</Text>
          ) : (
            <p className="ant-upload-text" style={{ color: '#6d6d6d' }}>
              Drag and drop, or click to browse
            </p>
          )}
        </Dragger>
      </Row>
      {props.attributes.properties?.category !== MetadataCategory.Image && (
        <Row
          className="content-action"
          style={{ marginBottom: 5, marginTop: 30 }}
        >
          <h3>{uploadMsg(props.attributes.properties?.category)}</h3>
          <Dragger
            accept={acceptableFiles(props.attributes.properties?.category)}
            style={{ padding: 20, background: 'rgba(255, 255, 255, 0.08)' }}
            multiple={false}
            customRequest={info => {
              // dont upload files here, handled outside of the control
              info?.onSuccess?.({}, null as any);
            }}
            fileList={mainFile ? [mainFile as any] : []}
            onChange={async info => {
              const file = info.file.originFileObj;

              // Reset image URL
              setCustomURL('');
              setCustomURLErr('');

              if (file) setMainFile(file);
            }}
            onRemove={() => {
              setMainFile(undefined);
            }}
          >
            <div className="ant-upload-drag-icon">
              <h3 style={{ fontWeight: 700 }}>Upload your creation</h3>
            </div>
            <p className="ant-upload-text" style={{ color: '#6d6d6d' }}>
              Drag and drop, or click to browse
            </p>
          </Dragger>
        </Row>
      )}
      {/* <Form.Item
        className={'url-form-action'}
        style={{
          width: '100%',
          flexDirection: 'column',
          paddingTop: 30,
          marginBottom: 4,
        }}
        label={<h3>OR use absolute URL to content</h3>}
        labelAlign="left"
        colon={false}
        validateStatus={customURLErr ? 'error' : 'success'}
        help={customURLErr}
      >
        <Input
          disabled={!!mainFile}
          placeholder="http://example.com/path/to/image"
          value={customURL}
          onChange={ev => setCustomURL(ev.target.value)}
          onFocus={() => setCustomURLErr('')}
          onBlur={() => {
            if (!customURL) {
              setCustomURLErr('');
              return;
            }

            try {
              // Validate URL and save
              new URL(customURL);
              setCustomURL(customURL);
              setCustomURLErr('');
            } catch (e) {
              console.error(e);
              setCustomURLErr('Please enter a valid absolute URL');
            }
          }}
        />
      </Form.Item> */}
      <Row>
        <Button
          type="primary"
          size="large"
          disabled={disableContinue}
          onClick={() => {
            props.setAttributes({
              ...props.attributes,
              properties: {
                ...props.attributes.properties,
                files: [coverFile, mainFile, customURL]
                  .filter(f => f)
                  .map(f => {
                    const uri = typeof f === 'string' ? f : f?.name || '';
                    const type =
                      typeof f === 'string' || !f
                        ? 'unknown'
                        : f.type || getLast(f.name.split('.')) || 'unknown';

                    return {
                      uri,
                      type,
                    } as MetadataFile;
                  }),
              },
              image: coverFile?.name || '',
              animation_url:
                props.attributes.properties?.category !==
                  MetadataCategory.Image && customURL
                  ? customURL
                  : mainFile && mainFile.name,
            });
            const files = [coverFile, mainFile].filter(f => f) as File[];

            props.setFiles(files);
            props.confirm();
          }}
          style={{ marginTop: 24 }}
          className="action-btn"
        >
          Continue to Mint
        </Button>
      </Row>
    </>
  )
}

export interface UserValue {
  key: string;
  label: string;
  value: string;
}

const InfoStep = (props: {
  attributes: IMetadataExtension;
  files: File[];
  setAttributes: (attr: IMetadataExtension) => void;
  confirm: () => void;
}) => {
  const [creators, setCreators] = React.useState<Array<UserValue>>([]);
  const [royalties, setRoyalties] = React.useState<Array<Royalty>>([]);
  const { image, animation_url } = useArtworkFiles(
    props.files,
    props.attributes,
  );
  const [form] = Form.useForm();

  React.useEffect(() => {
    setRoyalties(
      creators.map(creator => ({
        creatorKey: creator.key,
        amount: Math.trunc(100 / creators.length),
      })),
    );
  }, [creators]);
  return (
    <>
      <Row className="call-to-action">
        <h2>Describe your item</h2>
        <p>
          Provide detailed description of your creative process to engage with
          your audience.
        </p>
      </Row>
      <Row className="content-action" justify="space-around" style={{ alignItems: "flex-start" }}>
        <Col>
          {props.attributes.image && (
            <>
              {
                <img src={image} width={150} height={150} />
              }

              {/* <ArtCard
              image={image}
              animationURL={animation_url}
              category={props.attributes.properties?.category}
              name={props.attributes.name}
              symbol={props.attributes.symbol}
              small={true}
            /> */}
            </>

          )}
        </Col>
        <Col className="section" style={{ minWidth: 600 }}>
          <label className="action-field">
            <span className="field-title">Title</span>
            <Input
              autoFocus
              className="input"
              placeholder="Max 50 characters"
              allowClear
              value={props.attributes.name}
              onChange={info =>
                props.setAttributes({
                  ...props.attributes,
                  name: info.target.value,
                })
              }
            />
          </label>
          {/* <label className="action-field">
            <span className="field-title">Symbol</span>
            <Input
              className="input"
              placeholder="Max 10 characters"
              allowClear
              value={props.attributes.symbol}
              onChange={info =>
                props.setAttributes({
                  ...props.attributes,
                  symbol: info.target.value,
                })
              }
            />
          </label> */}

          <label className="action-field">
            <span className="field-title">Description</span>
            <Input.TextArea
              className="input textarea"
              placeholder="Max 500 characters"
              value={props.attributes.description}
              onChange={info =>
                props.setAttributes({
                  ...props.attributes,
                  description: info.target.value,
                })
              }
              allowClear
            />
          </label>
          {/* <label className="action-field">
            <span className="field-title">Maximum Supply</span>
            <InputNumber
              placeholder="Quantity"
              onChange={(val: number) => {
                props.setAttributes({
                  ...props.attributes,
                  properties: {
                    ...props.attributes.properties,
                    maxSupply: val,
                  },
                });
              }}
              className="royalties-input"
            />
          </label> */}
          <label className="action-field">
            <span className="field-title">Attributes</span>
          </label>
          <Form name="dynamic_attributes" form={form} autoComplete="off">
            <Form.List name="attributes">
              {(fields, { add, remove }) => (
                <>
                  {/* @ts-ignore */}
                  {fields.map(({ key, name, fieldKey }) => (
                    <Space key={key} align="baseline">
                      <Form.Item
                        name={[name, 'trait_type']}
                        fieldKey={[fieldKey, 'trait_type']}
                        hasFeedback
                      >
                        <Input placeholder="trait_type (Optional)" />
                      </Form.Item>
                      <Form.Item
                        name={[name, 'value']}
                        fieldKey={[fieldKey, 'value']}
                        rules={[{ required: true, message: 'Missing value' }]}
                        hasFeedback
                      >
                        <Input placeholder="value" />
                      </Form.Item>
                      <Form.Item
                        name={[name, 'display_type']}
                        fieldKey={[fieldKey, 'display_type']}
                        hasFeedback
                      >
                        <Input placeholder="display_type (Optional)" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add attribute
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </Col>
      </Row>

      <Row>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            form.validateFields().then(values => {
              const nftAttributes = values.attributes;
              // value is number if possible
              for (const nftAttribute of nftAttributes || []) {
                const newValue = Number(nftAttribute.value);
                if (!isNaN(newValue)) {
                  nftAttribute.value = newValue;
                }
              }
              console.log('Adding NFT attributes:', nftAttributes);
              props.setAttributes({
                ...props.attributes,
                attributes: nftAttributes,
              });

              props.confirm();
            });
          }}
          className="action-btn"
        >
          Continue to royalties
        </Button>
      </Row>
    </>
  );
};




interface Royalty {
  creatorKey: string;
  amount: number;
}

const useArtworkFiles = (files: File[], attributes: IMetadataExtension) => {
  const [data, setData] = React.useState<{ image: string; animation_url: string }>({
    image: '',
    animation_url: '',
  });

  React.useEffect(() => {
    if (attributes.image) {
      const file = files.find(f => f.name === attributes.image);
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          setData((data: any) => {
            return {
              ...(data || {}),
              image: (event.target?.result as string) || '',
            };
          });
        };
        if (file) reader.readAsDataURL(file);
      }
    }

    if (attributes.animation_url) {
      const file = files.find(f => f.name === attributes.animation_url);
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          setData((data: any) => {
            return {
              ...(data || {}),
              animation_url: (event.target?.result as string) || '',
            };
          });
        };
        if (file) reader.readAsDataURL(file);
      }
    }
  }, [files, attributes]);

  return data;
};


const RoyaltiesStep = (props: {
  attributes: IMetadataExtension;
  setAttributes: (attr: IMetadataExtension) => void;
  confirm: () => void;
}) => {
  // const file = props.attributes.image;
  const { publicKey, connected } = useWallet();
  const [creators, setCreators] = React.useState<Array<UserValue>>([]);
  const [fixedCreators, setFixedCreators] = React.useState<Array<UserValue>>([]);
  const [royalties, setRoyalties] = React.useState<Array<Royalty>>([]);
  const [totalRoyaltyShares, setTotalRoyaltiesShare] = React.useState<number>(0);
  const [showCreatorsModal, setShowCreatorsModal] = React.useState<boolean>(false);
  const [isShowErrors, setIsShowErrors] = React.useState<boolean>(false);

  const [newCreator, setNewCreator] = React.useState('');

  const newCreatorChangeHandler = (value: string) => {
    setNewCreator(value);
  }

  const addCreator = () => {
    setCreators([...creators, { key: newCreator, label: shortenAddress(newCreator), value: newCreator } as UserValue])
    setShowCreatorsModal(false)
  }

  React.useEffect(() => {

    if (publicKey) {
      const key = publicKey.toBase58();
      setFixedCreators([
        {
          key,
          label: shortenAddress(key),
          value: key,
        },
      ]);
    }
  }, [connected, setCreators]);

  React.useEffect(() => {
    setRoyalties(
      [...fixedCreators, ...creators].map(creator => ({
        creatorKey: creator.key,
        amount: Math.trunc(100 / [...fixedCreators, ...creators].length),
      })),
    );
  }, [creators, fixedCreators]);

  React.useEffect(() => {
    // When royalties changes, sum up all the amounts.
    const total = royalties.reduce((totalShares, royalty) => {
      return totalShares + royalty.amount;
    }, 0);

    setTotalRoyaltiesShare(total);
  }, [royalties]);

  return (
    <>
      <Row className="call-to-action" style={{ marginBottom: 20 }}>
        <h2>Set royalties and creator splits</h2>
        <p>
          Royalties ensure that you continue to get compensated for your work
          after its initial sale.
        </p>
      </Row>
      <Row className="content-action" style={{ marginBottom: 20 }}>
        <label className="action-field">
          <span className="field-title">Royalty Percentage</span>
          <p>
            This is how much of each secondary sale will be paid out to the
            creators.
          </p>
          <InputNumber
            autoFocus
            min={0}
            max={100}
            placeholder="Between 0 and 100"
            onChange={(val: number) => {
              props.setAttributes({
                ...props.attributes,
                seller_fee_basis_points: val * 100,
              });
            }}
            className="royalties-input"
          />
        </label>
      </Row>
      {[...fixedCreators, ...creators].length > 0 && (
        <Row>
          <label className="action-field" style={{ width: '100%' }}>
            <span className="field-title">Creators Split</span>
            <p>
              This is how much of the proceeds from the initial sale and any
              royalties will be split out amongst the creators.
            </p>
            <RoyaltiesSplitter
              creators={[...fixedCreators, ...creators]}
              royalties={royalties}
              setRoyalties={setRoyalties}
              isShowErrors={isShowErrors}
            />
          </label>
        </Row>
      )}
      {

        <Row>
          {
            !showCreatorsModal &&
            <span
              onClick={() => setShowCreatorsModal(true)}
              style={{ padding: 10, marginBottom: 10 }}
            >
              <span
                style={{
                  color: 'white',
                  fontSize: 25,
                  padding: '0px 8px 3px 8px',
                  background: 'rgb(57, 57, 57)',
                  borderRadius: '50%',
                  marginRight: 5,
                  verticalAlign: 'middle',
                }}
              >
                +
              </span>
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  verticalAlign: 'middle',
                  lineHeight: 1,
                }}
              >
                Add another creator
              </span>
            </span>

          }
          {
            showCreatorsModal &&
            <>
              <input type="text" value={newCreator} onChange={(e) => newCreatorChangeHandler(e.target.value)} />
              <button className="height-p50" onClick={() => addCreator()}>Add</button>
              <button className="height-p50" onClick={() => setShowCreatorsModal(false)}>Cencel</button>
            </>
          }

        </Row>
      }
      {isShowErrors && totalRoyaltyShares !== 100 && (
        <Row>
          <Text  >
            {/* style={{ paddingBottom: "14px" }} */}
            The split percentages for each creator must add up to 100%. Current
            total split percentage is {totalRoyaltyShares}%.
          </Text>
        </Row>
      )}
      <Row>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            // Find all royalties that are invalid (0)
            const zeroedRoyalties = royalties.filter(
              royalty => royalty.amount === 0,
            );

            if (zeroedRoyalties.length !== 0 || totalRoyaltyShares !== 100) {
              // Contains a share that is 0 or total shares does not equal 100, show errors.
              setIsShowErrors(true);
              return;
            }

            const creatorStructs: Creator[] = [
              ...fixedCreators,
              ...creators,
            ].map(
              c =>
                new Creator({
                  address: c.value,
                  verified: c.value === publicKey?.toBase58(),
                  share:
                    royalties.find(r => r.creatorKey === c.value)?.amount ||
                    Math.round(100 / royalties.length),
                }),
            );

            const share = creatorStructs.reduce(
              (acc, el) => (acc += el.share),
              0,
            );
            if (share > 100 && creatorStructs.length) {
              creatorStructs[0].share -= share - 100;
            }
            console.log({
              ...props.attributes,
              creators: creatorStructs,
            })
            console.log(royalties, "royalties")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            props.setAttributes({
              ...props.attributes,
              creators: creatorStructs,
            });
            props.confirm();
          }}
          className="action-btn"
        >
          Continue to review
        </Button>
      </Row>
    </>
  );
};


const RoyaltiesSplitter = (props: {
  creators: Array<UserValue>;
  royalties: Array<Royalty>;
  setRoyalties: Function;
  isShowErrors?: boolean;
}) => {
  return (
    <Col>
      <Col>
        {props.creators.map((creator, idx) => {
          const royalty = props.royalties.find(
            royalty => royalty.creatorKey === creator.key,
          );
          if (!royalty) return null;

          const amt = royalty.amount;

          const handleChangeShare = (newAmt: number) => {
            props.setRoyalties(
              props.royalties.map(_royalty => {
                return {
                  ..._royalty,
                  amount:
                    _royalty.creatorKey === royalty.creatorKey
                      ? newAmt
                      : _royalty.amount,
                };
              }),
            );
          };

          return (
            <Col span={24} key={idx}>
              <Row
                align="middle"
                gutter={[0, 16]}
                style={{ margin: '5px auto' }}
              >
                <Col span={4} style={{ padding: 10 }}>
                  {creator.label}
                </Col>
                <Col span={3}>
                  <InputNumber<number>
                    min={0}
                    max={100}
                    formatter={value => `${value}%`}
                    value={amt}
                    parser={value => parseInt(value?.replace('%', '') ?? '0')}
                    onChange={handleChangeShare}
                    className="royalties-input"
                  />
                </Col>
                <Col span={4} style={{ paddingLeft: 12 }}>
                  <Slider value={amt} onChange={handleChangeShare} />
                </Col>
                {props.isShowErrors && amt === 0 && (
                  <Col style={{ paddingLeft: 12 }}>
                    <Text >
                      The split percentage for this creator cannot be 0%.
                    </Text>
                  </Col>
                )}
              </Row>
            </Col>
          );
        })}
      </Col>
    </Col>
  );
};

const LaunchStep = (props: {
  confirm: () => void;
  attributes: IMetadataExtension;
  files: File[];
  connection: Connection;
}) => {
  const [cost, setCost] = React.useState(0);
  const { image, animation_url } = useArtworkFiles(
    props.files,
    props.attributes,
  );
  const files = props.files;
  const metadata = props.attributes;
  React.useEffect(() => {
    const rentCall = Promise.all([
      props.connection.getMinimumBalanceForRentExemption(MintLayout.span),
      props.connection.getMinimumBalanceForRentExemption(MAX_METADATA_LEN),
    ]);
    if (files.length)
      getAssetCostToStore([
        ...files,
        new File([JSON.stringify(metadata)], 'metadata.json'),
      ]).then(async lamports => {
        const sol = lamports / LAMPORT_MULTIPLIER;

        // TODO: cache this and batch in one call
        const [mintRent, metadataRent] = await rentCall;

        // const uriStr = 'x';
        // let uriBuilder = '';
        // for (let i = 0; i < MAX_URI_LENGTH; i++) {
        //   uriBuilder += uriStr;
        // }

        const additionalSol = (metadataRent + mintRent) / LAMPORT_MULTIPLIER;

        // TODO: add fees based on number of transactions and signers
        setCost(sol + additionalSol);
      });
  }, [files, metadata, setCost]);

  return (
    <>
      <Row className="call-to-action">
        <h2>Launch your creation</h2>
        <p>
          Provide detailed description of your creative process to engage with
          your audience.
        </p>
      </Row>
      <Row className="content-action" justify="space-around">
        <Col>
          {props.attributes.image && (
            <>
              {
                <img src={image} width={200} height={200} />
              }

            </>
            // <img src={image}/>
            // <ArtCard
            //   image={image}
            //   animationURL={animation_url}
            //   category={props.attributes.properties?.category}
            //   name={props.attributes.name}
            //   symbol={props.attributes.symbol}
            //   small={true}
            // />
          )}
        </Col>
        <Col className="section" style={{ minWidth: 300 }}>
          <Statistic
            className="create-statistic"
            title="Royalty Percentage"
            value={props.attributes.seller_fee_basis_points / 100}
            precision={2}
            suffix="%"
          />
          {cost ?
            cost.toFixed(5) + " SOL"
            : (
              <Spin />
            )}
        </Col>
      </Row>
      <Row>
        <Button
          type="primary"
          size="large"
          onClick={props.confirm}
          className="action-btn"
        >
          Pay with SOL
        </Button>
        {/* <Button
          disabled={true}
          size="large"
          onClick={props.confirm}
          className="action-btn"
        >
          Pay with Credit Card
        </Button> */}
      </Row>
    </>
  );
};

const WaitingStep = (props: {
  mint: Function;
  minting: boolean;
  confirm: Function;
  step: number;
}) => {
  React.useEffect(() => {
    const func = async () => {
      await props.mint();
      props.confirm();
    };
    func();
  }, []);

  const setIconForStep = (currentStep: number, componentStep: number) => {
    if (currentStep === componentStep) {
      return <LoadingOutlined />;
    }
    return null;
  };

  return (
    <div
      style={{
        marginTop: 70,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Spin size="large" />
      <Card>
        <Steps direction="vertical" current={props.step}>
          <Step
            className={'white-description'}
            title="Minting"
            description="Starting Mint Process"
            icon={setIconForStep(props.step, 0)}
          />
          <Step
            className={'white-description'}
            title="Preparing Assets"
            icon={setIconForStep(props.step, 1)}
          />
          <Step
            className={'white-description'}
            title="Signing Metadata Transaction"
            description="Approve the transaction from your wallet"
            icon={setIconForStep(props.step, 2)}
          />
          <Step
            className={'white-description'}
            title="Sending Transaction to Solana"
            description="This will take a few seconds."
            icon={setIconForStep(props.step, 3)}
          />
          <Step
            className={'white-description'}
            title="Waiting for Initial Confirmation"
            icon={setIconForStep(props.step, 4)}
          />
          <Step
            className={'white-description'}
            title="Waiting for Final Confirmation"
            icon={setIconForStep(props.step, 5)}
          />
          <Step
            className={'white-description'}
            title="Uploading to Arweave"
            icon={setIconForStep(props.step, 6)}
          />
          <Step
            className={'white-description'}
            title="Updating Metadata"
            icon={setIconForStep(props.step, 7)}
          />
          <Step
            className={'white-description'}
            title="Signing Token Transaction"
            description="Approve the final transaction from your wallet"
            icon={setIconForStep(props.step, 8)}
          />
        </Steps>
      </Card>
    </div>
  );
};


const Congrats = (props: {
  nft?: {
    metadataAccount: StringPublicKey;
  };
  alert?: string;
  gotoStep1: () => void;
}) => {
  // const history = useHistory();

  const newTweetURL = () => {
    const params = {
      text: "I've created a new NFT artwork on Metaplex, check it out!",
      url: `${window.location.origin
        }/#/art/${props.nft?.metadataAccount.toString()}`,
      hashtags: 'NFT,Crypto,Metaplex',
      // via: "Metaplex",
      related: 'Metaplex,Solana',
    };
    const queryParams = new URLSearchParams(params).toString();
    return `https://twitter.com/intent/tweet?${queryParams}`;
  };

  if (props.alert) {
    // TODO  - properly reset this components state on error
    return (
      <>
        <div className="waiting-title">Sorry, there was an error!</div>
        <p>{props.alert}</p>
        <Button onClick={_ => props.gotoStep1()}>
          Back to Create NFT
        </Button>
      </>
    );
  }

  return (
    <>
      <div className="waiting-title">Congratulations, you created an NFT!</div>
      <div className="congrats-button-container">
        <Button
          className="metaplex-button"
          onClick={() => props.gotoStep1()}
        >
          <span>Go to StartPage&gt; </span>
          <span>&gt;</span>
        </Button>

      </div>
      <Confetti />
    </>
  );
};
