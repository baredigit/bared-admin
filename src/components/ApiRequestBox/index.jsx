import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { Flex } from '@strapi/design-system/Flex'
import { Typography } from '@strapi/design-system/Typography'
import { TextInput } from '@strapi/design-system/TextInput'
import { Button } from '@strapi/design-system/Button'
import styled from 'styled-components'
import { request } from '@api'
import ConfirmModal from '@components/ConfirmModal'
import ReactJson from 'react-json-view'

const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 4px;
  background: white;
  margin-top: 12px;
  width: 100%;
`

export default function ApiRequestBox ({
  requestParams,
  method,
  baseUrl,
  requestUrl,
  isPublic = false
}) {
  // requestParams -> [ cover: {type: 'string', required: false} ]

  if (requestParams) {
    console.log(requestParams)
  }

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [responseContent, setResponseContent] = useState({})
  const [urlParamsData, setUrlParamsData] = useState({})
  const [url, setUrl] = useState(requestUrl)
  const urlParams = requestUrl.split('/').filter(i => i.slice(0, 1) === ':')
  const jwt = useSelector(state => state.auth.jwt)

  const handleRequestButtonClick = () => {
    request({
      method,
      url,
      needToken: !isPublic,
      jwt
    })
      .then(response => {
        setConfirmModalOpen(true)
        setResponseContent(response)
      })
      .catch(err => {
        console.log(err)
      })
  }

  const handleSetUrlParamsData = (param, value) => {
    setUrlParamsData({
      ...urlParamsData,
      [param]: value
    })
  }

  useEffect(() => {
    const originalUrl = requestUrl
    let nextUrl
    if (Object.keys(urlParamsData).length > 0) {
      for (const i in urlParamsData) {
        nextUrl = originalUrl.replace(i, urlParamsData[i])
      }
      setUrl(nextUrl)
    }
  }, [urlParamsData])

  return (
    <Flex padding={4} direction='column' alignItems='flex-start'>
      <Flex paddingBottom={4}>Request URL: {baseUrl + url}</Flex>
      {
          urlParams && urlParams.length > 0 &&
            <Section>
              <Typography>URL Params</Typography>
              {
                urlParams.map(param => {
                  return (
                    <Flex key={param}>
                      <Typography style={{ marginRight: 8 }}>{param.replace(':', '').toUpperCase()}</Typography>
                      <TextInput
                        aria-label={param}
                        name={param.replace(':', '')}
                        value={urlParamsData[param] || ''}
                        onChange={e => handleSetUrlParamsData(param, e.target.value)}
                      />
                    </Flex>

                  )
                })
              }
            </Section>
        }
      <Flex paddingTop={4}>
        <Button onClick={handleRequestButtonClick}>Request</Button>
      </Flex>
      <ConfirmModal
        show={confirmModalOpen}
        hideCancel
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={() => setConfirmModalOpen(false)}
        ContentComponent={
          <ReactJson src={responseContent} name={false} />
        }
      />
    </Flex>
  )
}
