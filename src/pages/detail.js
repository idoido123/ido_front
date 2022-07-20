import {
  Heading, Container, GridItem,
  chakra, Grid, useMediaQuery, Center, Button, useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import KECCAK256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';
import Web3EthContract from 'web3-eth-contract';
import Web3 from 'web3';

function DetailPage(){
  const [abi,setAbi] = useState(null)
  const [whiteList,setWhiteList] = useState([])
  // 钱包地址
  const [walletAddress,setWalletAddress] = useState("")
  // 合约实例化
  const [contractObj,setContractObj] = useState(null)
  // web3实例化
  const [web3,setWeb3] = useState(null)
  const toast = useToast()

  const buf2hex = x => '0x' + x.toString('hex')
  const [rootHash,setRootHash] = useState("")
  const [gtree,setGTree] = useState(null)
  const [isMobile] = useMediaQuery("(max-width: 768px)")

  // init 配置
  useEffect(() => {
    (async ()=>{
      const abiResponse = await fetch("/abi.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const abi = await abiResponse.json();
      setAbi(abi)

      const whitelistResponse = await fetch("/whitelist.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const whiteList = await whitelistResponse.json();
      console.log(whiteList)
      setWhiteList(whiteList)

      const leaves = whiteList.map(x => KECCAK256(x));
      const tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true })
      let rootHash = tree.getRoot().toString("hex")
      setGTree(tree)
      setRootHash(rootHash)
    })()
  },[])

  useEffect(() => {
    if (walletAddress) {
      return
    }
    //
    (async ()=> {

    })()

  },[walletAddress])
  const mint = async () => {
    if (contractObj && walletAddress && web3) {
      let leaf = buf2hex(KECCAK256(walletAddress));
      let proof = gtree.getProof(leaf).map(x => buf2hex(x.data));
      //let price = web3.utils.toWei('1', 'ether');
      let price = web3.utils.toWei('0', 'ether');
      const result  = await contractObj.methods.mint(1, proof).send({ from: walletAddress, value: price, gas: 300000 })
      console.log(result)
    }
  }

  const connectWallet = async ()=>{
    if (abi) {
      const { ethereum } = window;
      const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
      if (!metamaskIsInstalled){
        toast({
          title: 'MetaMask is not installed.',
          description: "Please install MetaMask first.",
          status: 'warning',
          position:"top-right",
          duration: 3000,
          isClosable: true,
        })
        return
      }
    }else {
      toast({
        title: 'Abi file being loaded.',
        description: "Abi file being loaded.",
        status: 'warning',
        duration: 3000,
        position:"top-right",
        isClosable: true,
      })
      return
    }

    const { ethereum } = window;
    Web3EthContract.setProvider(ethereum);
    let web3 = new Web3(ethereum);
    setWeb3(web3)
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{
          chainId: Web3.utils.numberToHex(4) // 目标链ID
        }]
      })
    }catch (e){
      toast({
        title: 'Please add the ETH network node first.',
        description: "",
        status: 'warning',
        duration: 3000,
        position:"top-right",
        isClosable: true,
      })
      return
    }

    const networkId = await ethereum.request({
      method: "net_version",
    });

    if (networkId == 4) {
      await ethereum.request({
        method: "eth_requestAccounts",
      });
      const accounts = await web3.eth.getAccounts()
      setWalletAddress(accounts[0])
      const SmartContractObj = new Web3EthContract(
        abi,
        "0xecb2194d72dD4Ea3c348BFE379F204f0aD43eeB0"
      );
      setContractObj(SmartContractObj)
      // Add listeners start
      ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0])
      });

    }else {
      toast({
        title: 'Wrong network node.',
        description: "",
        status: 'warning',
        duration: 3000,
        position:"top-right",
        isClosable: true,
      })
      return
    }
  }


  return(
    <Container maxW='4xl'>
      <chakra.div  h="4.5rem" display={'flex'}  alignItems="center">
        {walletAddress?<chakra.div fontWeight={"500"} fontStyle={"italic"}>
            WalletAddress:{walletAddress}
          </chakra.div>:
          // _focus={{ boxShadow: "none",textDecoration:"none",border:'none' }}
          // _hover={{  bg:"blue.100",boxShadow: "none",textDecoration:"none",border:'none',color: "purple.500" }}
          // color="gray.500"
          <Button  colorScheme='blue' onClick={connectWallet}>Connect Metamask</Button>}

      </chakra.div>
      <chakra.div display={'flex'} justifyContent={'center'} flexDirection={'column'}>
        <Heading as='h4' size='md' textAlign={'center'}>Doge king</Heading>
        <chakra.div mt={1} fontStyle={'italic'} fontWeight={'500'} textAlign={'center'}>
          Public Sale
        </chakra.div>
        <chakra.div mt={2} mb={2} fontStyle={'italic'} fontSize={"md"} fontWeight={"400"}>
          Featured: Hide transactions involving tokens flagged as having poor reputation with
          Featured: Hide transactions involving tokens flagged as having poor reputation with
          Featured: Hide transactions involving tokens flagged as having poor reputation with
        </chakra.div>
      </chakra.div>

      <chakra.div display={'flex'} justifyContent={'center'}>
        <Button colorScheme='blue' mr={5}>Claim</Button>
        <Button colorScheme='blue' >Harvest</Button>
      </chakra.div>

      <Grid mt={3} templateColumns='repeat(2, 1fr)' gap={6}>
        <chakra.div h={"120px"}   _hover={{  bg:"blue.100",boxShadow: "none",textDecoration:"none",border:'none' }}
                    display={'flex'} flexDirection={'column'} alignContent={'center'}  borderRadius={"0.5rem"} bg={"blue.200"}  opacity={"0.8"} as={GridItem}>
          <chakra.span m={3} h={"20%"} fontSize={"2xl"} fontWeight={"bold"} color={"blue.600"}>Total Supply</chakra.span>
          <chakra.span h={"80%"} fontSize={"2xl"} m={3} fontWeight={'bold'} color={'black'}>10000</chakra.span>
        </chakra.div>

        <chakra.div h={"120px"}  _hover={{  bg:"blue.100",boxShadow: "none",textDecoration:"none",border:'none' }}
                    display={'flex'} flexDirection={'column'} alignContent={'center'}  borderRadius={"0.5rem"} bg={"blue.200"}  opacity={"0.8"} as={GridItem}>
          <chakra.span m={3} h={"20%"} fontSize={"2xl"} fontWeight={"bold"} color={"blue.600"}>Exchange</chakra.span>
          <chakra.span h={"80%"} fontSize={"2xl"} m={3} fontWeight={'bold'} color={'black'}>1BNB = 1000000Token</chakra.span>
        </chakra.div>
      </Grid>

      <Grid mt={3} templateColumns='repeat(2, 1fr)' gap={6}>
        <chakra.div h={"120px"}  _hover={{  bg:"blue.100",boxShadow: "none",textDecoration:"none",border:'none' }}
                    display={'flex'} flexDirection={'column'} alignContent={'center'}  borderRadius={"0.5rem"} bg={"blue.200"}  opacity={"0.8"} as={GridItem}>
          <chakra.span m={3} h={"20%"} fontSize={"2xl"} fontWeight={"bold"} color={"blue.600"}>Harvest Supply</chakra.span>
          <chakra.span h={"80%"} fontSize={"2xl"} m={3} fontWeight={'bold'} color={'black'}>10000</chakra.span>
        </chakra.div>

        <chakra.div h={"120px"}  _hover={{  bg:"blue.100",boxShadow: "none",textDecoration:"none",border:'none' }}
                    display={'flex'} flexDirection={'column'} alignContent={'center'}  borderRadius={"0.5rem"} bg={"blue.200"}  opacity={"0.8"} as={GridItem}>
          <chakra.span m={3} h={"20%"} fontSize={"2xl"} fontWeight={"bold"} color={"blue.600"}>Next Harvest Time</chakra.span>
          <chakra.span h={"80%"} fontSize={"2xl"} m={3} fontWeight={'bold'} color={'black'}>10000</chakra.span>
        </chakra.div>
      </Grid>

    </Container>
  )
}

export default DetailPage