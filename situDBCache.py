import os 
import BaseHTTPServer
import httplib2
#from httplib2 import Http
from urllib import urlencode
import urlparse
import json

SERVER_HOST = 'localhost'
SERVER_PORT = 5050

SITU_DB_URL = "http://eoc.sv.cmu.edu:3000"
jsonCache = {} # { 'd12e76a4-1221-11e2-8599-68a86d092e88' : 'FUCK IT' }

class CacheHandler( BaseHTTPServer.BaseHTTPRequestHandler ) :
	def do_HEAD( self ) :
		self.send_response(200)
		self.send_header("Content-type", "text/html")
		self.end_headers()
	


	def do_GET( self ) :
		self.handleMSG( "GET" )
		return



	def do_POST ( self ) :
		self.handleMSG ( "POST" )
		return







	def handleMSG ( self, msgType ) :
		if self.path == "/get_properties" :
			#print( self.headers ) # urlparse.parse_qs( self.path ) ) #os.environ['QUERY_STRING'] )
		        varLen = int( self.headers['Content-Length'] )
			postVars = self.rfile.read( varLen )
			#print postVars
			guidList = json.loads( postVars )
		
			# print guidList
			retDict = {}
			requestDict = {}
			for key, val in guidList.iteritems() :
				if isImmutable( val ) :
					if val in jsonCache :
						retDict[ val ] = jsonCache[ val ]
					else :
						requestDict[ 'GUID' ] = val
				else :
					requestDict[ 'GUID' ] = val

			
			if len( requestDict ) != 0 :
				# Prepare headers for querying EOC server
				outHeaders = {}
				outHeaders[ 'Content-Type' ] = self.headers[ 'Content-Type' ]
				outHeaders[ 'Accept' ] = "*/*"
				# Prepare msg body for EOC server query
				bodyData = json.dumps( requestDict )
				# Query EOC server and append results to cache results
				h = httplib2.Http()
				resp, content = h.request( SITU_DB_URL + self.path, method = msgType, headers = outHeaders, body = bodyData )
				serverRespDict = json.loads( content )
				retDict.update( serverRespDict )

				# Store values to cache
				if int( resp[ 'status' ] ) == 200 :
					for key, val in serverRespDict.iteritems() :
						if isImmutable( key ) :
							jsonCache[ key ] = val

				# Send reply to query
				self.send_response( int( resp[ 'status' ] ) )
				self.send_header("Content-type", "text/html")
				self.end_headers()
				self.wfile.write( json.dumps( retDict ) )
			else :
				self.send_response(200)
				self.send_header("Content-type", "text/html")
				self.end_headers()
				self.wfile.write( json.dumps( retDict ) )


		else : 
			# Prepare headers for querying EOC server
			outHeaders = {}
			outHeaders[ 'Content-Type' ] = self.headers[ 'Content-Type' ]
			outHeaders[ 'Accept' ] = "*/*"

			# Prepare msg body for EOC server query
			varLen = int( self.headers['Content-Length'] )
			bodyData = self.rfile.read( varLen )

			# Query EOC server
			h = httplib2.Http()
			resp, content = h.request( SITU_DB_URL + self.path, method = msgType, headers = outHeaders, body = bodyData )

			# Pass on response from server
			self.send_response( int( resp[ 'status' ] ) )
			self.send_header("Content-type", "text/html")
			self.end_headers()
			self.wfile.write( content )
		return	




def isImmutable ( guid ) :
	#print( guid )
	#return True
	if guid.startswith( "I-" ) :
		return True
	else : # assume the other options is starting with "M-"
		return False






if __name__ == '__main__' :
	server_class = BaseHTTPServer.HTTPServer
	httpd = server_class( ( SERVER_HOST, SERVER_PORT ), CacheHandler )
	try:
		httpd.serve_forever()
	except KeyboardInterrupt:
		pass
	httpd.server_close()
